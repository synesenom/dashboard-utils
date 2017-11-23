/**
 * Module implementing a line chart.
 * Part of the Analytics Dashboard Tools.
 *
 * @copyright Copyright (C) 2017 Sony Mobile Communications Inc.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * @author Enys Mones (enys.mones@sony.com)
 * @module widgets.linechart
 * @memberOf adt
 * @requires d3@v4
 * @requires adt.widgets
 */
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory((global.adt = global.adt || {}));
    }
} (this, (function (exports) {
    "use strict";

    // Load widgets
    if (exports.widgets) {
        var widgets = exports.widgets;
    } else {
        throw new Error("adt.widgets.linechart Error: widgets module is not exported");
    }

    /**
     * The line chart widget class.
     *
     * @class LineChart
     * @memberOf adt.widgets.linechart
     * @param {string} name Identifier of the widget.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * @constructor
     */
    function LineChart(name, parent) {
        var _w = widgets.Widget.call(this, name, "lineChart", "svg", parent);

        /**
         * Sets the X label.
         *
         * @method xLabel
         * @memberOf adt.widgets.linechart.LineChart
         * @param {string} label Text to set label to.
         */
        _w.attr.add(this, "xLabel", "");

        /**
         * Sets the Y label.
         *
         * @method yLabel
         * @memberOf adt.widgets.linechart.LineChart
         * @param {string} label Text to set label to.
         */
        _w.attr.add(this, "yLabel", "");

        /**
         * Sets the type of the X axis.
         * Supported values are: number, time, string.
         * Default is number.
         *
         * @method xType
         * @memberOf adt.widgets.linechart.LineChart
         * @param {string} type Type of the X axis.
         */
        _w.attr.add(this, "xType", "number");

        /**
         * Sets the formatting function of the y ticks.
         * Default is a float with two decimals.
         *
         * @method yTIckFormat
         * @memberOf adt.widgets.linechart.LineChart
         * @param {function} format Formatting function.
         */
        _w.attr.add(this, "yTickFormat", d3.format(".2s"));

        /**
         * Sets the color of the lines.
         * Default is grey.
         *
         * @method colors
         * @memberOf adt.widgets.linechart.LineChart
         * @param {(string|object)} color Single color string or an object containing colors for each plot.
         */
        _w.attr.add(this, "colors", "grey");

        /**
         * Sets lower boundary of the Y axis.
         * Default is 0.
         *
         * @method yMin
         * @memberOf adt.widgets.linechart.LineChart
         * @param {number} value Value to set lower boundary to.
         */
        _w.attr.add(this, "yMin", 0);

        /**
         * Sets callback for mouse over on a line.
         * Must accept an argument with the name of the line.
         *
         * @method mouseover
         * @memberOf adt.widgets.linechart.LineChart
         * @param {function} callback Callback to set.
         */
        _w.attr.add(this, "mouseover", null);

        /**
         * Sets callback for mouse leave on a line.
         * Must accept an argument with the name of the line.
         *
         * @method mouseleave
         * @memberOf adt.widgets.linechart.LineChart
         * @param {function} callback Callback to set.
         */
        _w.attr.add(this, "mouseleave", null);

        // Widget elements.
        var _svg = null;
        var _data = [];
        var _scaleFactor = 1.0;
        var _markers = [];

        /**
         * Binds data to the line plot.
         * Data must be an array of {x: number, y: object} where y is an object containing the Y values for each line
         * to plot. The data can optionally contain a {dy} property that corresponds to the error drawn around the line.
         * Error is only drawn for lines that are defined as property in {dy}.
         *
         * @method data
         * @memberOf adt.widgets.linechart.LineChart
         * @param {Array} data Array of data points.
         * @param {number} scale Optional scaling parameter. Each data point is divided by this value.
         */
        this.data = function(data, scale) {
            _data = _.cloneDeep(data);

            // Sort if number / date
            if (_w.attr.xType === "number" || _w.attr.xType === "time") {
                _data.sort(function(a, b) {
                    return a.x - b.x;
                });
            }

            // Scale data
            if (typeof scale === "number" && scale > 0)
                _scaleFactor = scale;
            return this;
        };

        /**
         * Highlights the specified plot.
         *
         * @method highlight
         * @memberOf adt.widgets.linechart.LineChart
         * @param {string} key Key of the line to highlight.
         */
        this.highlight = function(key) {
            _w.utils.highlight(_svg, ".line", key);
        };

        /**
         * Adds a marker to the specified line.
         * A marker is a text along with a 90-degree angle connecting two points of a line.
         * If a marker with the specified identifier already exists, the marker is ignored.
         *
         * @method addMarker
         * @memberOf adt.widgets.linechart.LineChart
         * @param {string} id Marker identifier.
         * @param {string} key Key of the line to mark.
         * @param {(number|string)} start Start X position of the marker.
         * @param {(number|string)} end End X position of the marker.
         * @param {string} label Label of the marker.
         * @returns {?object} D3 selection of the marker if it could be added, null otherwise.
         */
        this.addMarker = function(id, key, start, end, label) {
            // Check if marker exists
            if (_markers.hasOwnProperty(id)) {
                return null;
            }

            // Get Y coordinates
            var row1 = _data.filter(function(d) {
                return d.x === start;
            })[0];
            if (!row1 || !row1.hasOwnProperty('y') || !row1.y.hasOwnProperty(key))
                return null;
            var y1 = row1.y[key];
            var row2 = _data.filter(function(d) {
                return d.x === end;
            })[0];
            if (!row2 || !row2.hasOwnProperty('y') || !row2.y.hasOwnProperty(key))
                return null;
            var y2 = row2.y[key];

            // Get color
            var color = typeof _w.attr.colors === "string" ? _w.attr.colors : _w.attr.colors[key];

            // Add marker
            var xCorner = y1 < y2 ? start : end;
            var yCorner = y1 < y2 ? y2 : y1;
            var marker = _svg.g.append("g")
                .attr("class", "marker");
            marker.append("line")
                .attr("x1", _svg.scale.x(start)+2)
                .attr("y1", _svg.scale.y(yCorner))
                .attr("x2", _svg.scale.x(end)+2)
                .attr("y2", _svg.scale.y(yCorner))
                .style("stroke", color)
                .style("stroke-dasharray", "3 3")
                .style("stroke-width", 2);
           marker.append("line")
                .attr("x1", _svg.scale.x(xCorner)+2)
                .attr("y1", _svg.scale.y(y1))
                .attr("x2", _svg.scale.x(xCorner)+2)
                .attr("y2", _svg.scale.y(y2))
                .style("stroke", color)
                .style("stroke-dasharray", "3 3")
                .style("stroke-width", 2);
            marker.append("circle")
                .attr("cx", _svg.scale.x(start)+2)
                .attr("cy", _svg.scale.y(y1))
                .attr("r", 4)
                .style("stroke", "none")
                .style("fill", color);
            marker.append("circle")
                .attr("cx", _svg.scale.x(end)+2)
                .attr("cy", _svg.scale.y(y2))
                .attr("r", 4)
                .style("stroke", "none")
                .style("fill", color);
            marker.append("text")
                .attr("x", _svg.scale.x(xCorner)+2)
                .attr("y", _svg.scale.y(yCorner))
                .attr("dy", -5)
                .attr("text-anchor", y1 < y2 ? "start" : "end")
                .style("fill", _w.attr.fontColor)
                .style("font-family", "inherit")
                .style("font-size", "0.9em")
                .text(label);

            // Add to markers
            _markers[id] = marker;

            // Return marker
            return marker;
        };

        /**
         * Removes a marker from the plot.
         *
         * @method removeMarker
         * @memberOf adt.widgets.linechart.LineChart
         * @param {string} id Identifier of the marker to remove.
         * @returns {boolean} True if marker exists and could be removed, false otherwise.
         */
        this.removeMarker = function(id) {
            if (_markers.hasOwnProperty(id)) {
                _markers[id].remove();
                delete _markers[id];
                return true;
            }
            return false;
        };

        // Rendering methods.
        _w.render.build = function() {
            if (_svg !== null)
                return;
            _svg = {};

            // Add chart itself
            _svg.g = _w.widget.append("g");

            // Add axes
            _svg.axisFn = {
                x: d3.axisBottom()
                    .ticks(7),
                y: d3.axisLeft()
                    .ticks(5)
                    .tickFormat(_w.attr.yTickFormat)
            };
            _svg.axes = {
                x: _svg.g.append("g")
                    .attr("class", "x axis")
                    .attr("font-family", "inherit"),
                y: _svg.g.append("g")
                    .attr("class", "y axis")
                    .attr("font-family", "inherit")
            };

            // Add labels
            _svg.labels = {
                x: _svg.g.append("text")
                    .attr("class", "x axis-label")
                    .attr("text-anchor", "end")
                    .attr("font-family", "inherit")
                    .attr("stroke-width", 0),
                y: _svg.g.append("text")
                    .attr("class", "y axis-label")
                    .attr("text-anchor", "begin")
                    .attr("font-family", "inherit")
                    .attr("stroke-width", 0)
            };

            // Add error bands
            _svg.errors = {};
            _.forOwn(_data[0].y, function(yk, k) {
                _svg.errors[k] = _svg.g.append("path")
                    .attr("class", "error " + _w.utils.encode(k))
                    .style("fill-opacity", 0.2)
                    .style("stroke-width", "0px")
                    .style("shape-rendering", "geometricPrecision");
            });

            // Add lines
            _svg.lines = {};
            _.forOwn(_data[0].y, function(yk, k) {
                _svg.lines[k] = _svg.g.append("path")
                    .attr("class", "line " + _w.utils.encode(k))
                    .style("fill", "none")
                    .style("stroke-width", "2px")
                    .style("shape-rendering", "geometricPrecision");
            });
        };

        _w.render.update = function(duration) {
            // Make scaled copy of data
            var data = _.cloneDeep(_data);
            for (var i = 0; i < data.length; i++) {
                for (var y in data[i].y) {
                    if (data[i].y.hasOwnProperty(y))
                        data[i].y[y] /= _scaleFactor;

                    // Check if we have error
                    if (data[i].hasOwnProperty('dy')) {
                        if (data[i].dy.hasOwnProperty(y))
                            data[i].dy[y] /= _scaleFactor;
                    }
                }
            }

            // Scale and axes
            _svg.scale = _w.utils.scale(_w.utils.boundary(data, {y: [_w.attr.yMin, null]}),
                _w.attr.width - _w.attr.margins.left - _w.attr.margins.right,
                _w.attr.height - _w.attr.margins.top - _w.attr.margins.bottom,
                {x: {type: _w.attr.xType}});
            _svg.axes.x
                .transition().duration(duration)
                .call(_svg.axisFn.x.scale(_svg.scale.x));
            _svg.axes.y
                .transition().duration(duration)
                .call(_svg.axisFn.y.scale(_svg.scale.y));

            // Lines and error bands
            _.forOwn(data[0].y, function(yk, k) {
                if (data[0].hasOwnProperty('dy') && data[0].dy.hasOwnProperty(k)) {
                    var error = d3.area()
                        .x(function (d) {
                            return scale.x(d.x) + 2;
                        }).y0(function (d) {
                            return scale.y(d.y[k]-d.dy[k]);
                        }).y1(function (d) {
                            return scale.y(d.y[k]+d.dy[k]);
                        });
                    _svg.errors[k]
                        .transition().duration(duration)
                        .attr("d", error(data));
                }
                var line = d3.line()
                    .x(function (d) {
                        return _svg.scale.x(d.x) + 2;
                    }).y(function (d) {
                        return _svg.scale.y(d.y[k]);
                    });
                _svg.lines[k]
                    .transition().duration(duration)
                    .attr("d", line(data));
            });
        };

        _w.render.style = function() {
            // Inner dimensions
            var innerWidth = _w.attr.width - _w.attr.margins.left - _w.attr.margins.right,
                innerHeight = _w.attr.height - _w.attr.margins.top - _w.attr.margins.bottom;

            // Chart (using conventional margins)
            _svg.g
                .attr("width", innerWidth + "px")
                .attr("height", innerHeight + "px")
                .attr("transform", "translate(" + _w.attr.margins.left + "," + _w.attr.margins.top + ")")
                .style("pointer-events", "all");

            // Axes
            _svg.axes.x
                .attr("transform", "translate(0," + innerHeight + ")");
            _svg.axisFn.y.tickFormat(_w.attr.yTickFormat);
            _svg.axes.y
                .attr("transform", "translate(0," + 1 + ")");
            _svg.g.selectAll(".axis path")
                .style("fill", "none")
                .style("stroke", _w.attr.fontColor)
                .style("stroke-width", "2px")
                .style("shape-rendering", "crispEdges");
            _svg.g.selectAll(".tick > line")
                .style("stroke", _w.attr.fontColor)
                .style("stroke-width", "2px");
            _svg.g.selectAll(".tick > text")
                .attr("stroke-width", 0)
                .style("font-size", _w.attr.fontSize + "px")
                .style("fill", _w.attr.fontColor);

            // Labels
            _svg.labels.x
                .attr("x", innerWidth + "px")
                .attr("y", (innerHeight + 35) + "px")
                .style("font-size", _w.attr.fontSize + "px")
                .style("fill", _w.attr.fontColor)
                .text(_w.attr.xLabel);
            _svg.labels.y
                .attr("x", 5 + "px")
                .attr("y", (-5) + "px")
                .style("font-size", _w.attr.fontSize + "px")
                .style("fill", _w.attr.fontColor)
                .text(_w.attr.yLabel);

            // Plot
            _.forOwn(_svg.errors, function(lk, k) {
                _svg.errors[k]
                    .style("fill", typeof _w.attr.colors === "string" ? _w.attr.colors : _w.attr.colors[k])
                    .on("mouseover", function() {
                        _w.attr.mouseover && _w.attr.mouseover(k);
                    })
                    .on("mouseleave", function() {
                        _w.attr.mouseleave && _w.attr.mouseleave(k);
                    });
            });
            _.forOwn(_svg.lines, function(lk, k) {
                _svg.lines[k]
                    .style("stroke", typeof _w.attr.colors === "string" ? _w.attr.colors : _w.attr.colors[k])
                    .on("mouseover", function() {
                        _w.attr.mouseover && _w.attr.mouseover(k);
                    })
                    .on("mouseleave", function() {
                        _w.attr.mouseleave && _w.attr.mouseleave(k);
                    });
            });

            _w.widget.style("display", "block");
        };
    }

    LineChart.prototype = Object.create(widgets.Widget.prototype);
    exports.widgets.LineChart = LineChart;
})));