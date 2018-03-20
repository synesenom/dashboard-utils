var width = 260;
var height = 200;
var colors = {
    plum: "darkmagenta",
    banana: "gold",
    mango: "tomato",
    orange: "orange",
    melon: "green",
    kiwi: "limegreen",
    pear: "khaki"
};

// Area chart
new du.widgets.AreaChart("areachart", "#areachart")
    .width(width)
    .height(height)
    .xLabel("value")
    .yLabel("probability density")
    .margins({left: 40, top: 20, right: 20, bottom: 40})
    .fontSize(12)
    .data(Array.from(new Array(100).keys()).map(function (i) {
        return {
            x: i,
            y: {
                mango: 10 * Math.pow(i / 40, 2),
                kiwi: 10 * Math.log(i + 1) * Math.pow(Math.cos(Math.PI * i / 15), 2) + 2
            }
        }
    }))
    .colors(colors)
    .render();

// Bar chart
new du.widgets.BarChart("barchart", "#barchart")
    .width(width)
    .height(height)
    .xLabel("fruit name")
    .yLabel("stock")
    .margins({left: 60, top: 20, right: 20, bottom: 40})
    .fontSize(12)
    .vertical(true)
    .data({
        plum: 13,
        banana: 4,
        mango: 6,
        orange: 2,
        melon: 11,
        kiwi: 7,
        pear: 3
    })
    .colors(colors)
    .render();

// Chord chart
new du.widgets.ChordChart("chordchart", "#chordchart")
    .x(width / 2 - height / 2)
    .radius(height / 2)
    .thickness(10)
    .margins(40)
    .fontSize(12)
    .ticks(true)
    .data([
        {source: "melon", target: "plum", value: 1},
        {source: "melon", target: "pear", value: 2},
        {source: "melon", target: "kiwi", value: 3},
        {source: "plum", target: "melon", value: 4},
        {source: "plum", target: "pear", value: 5},
        {source: "plum", target: "kiwi", value: 6},
        {source: "pear", target: "melon", value: 7},
        {source: "pear", target: "plum", value: 8},
        {source: "pear", target: "kiwi", value: 9},
        {source: "kiwi", target: "melon", value: 10},
        {source: "kiwi", target: "plum", value: 11},
        {source: "kiwi", target: "pear", value: 12},
        {source: "orange", target: "plum", value: 1},
        {source: "plum", target: "orange", value: 2}
    ])
    .colors(colors)
    .render();

// Description
d3.select("#description").append("div")
    .style("margin-top", "50px")
    .style("margin-left", "30px")
    .style("width", "auto")
    .style("max-width", "170px")
    .style("padding", "10px")
    .style("background", "white")
    .style("box-shadow", "0 0 1px black")
    .style("border-radius", "3px")
    .style("color", "black")
    .style("font-size", "0.8em")
    .style("line-height", "1.35em")
    .text("This is a chart showing some cool data");

// Grid
var grid = new du.widgets.Grid("grid", "#grid")
    .width(width)
    .height(height)
    .rows(2)
    .cols(2)
    .render();
grid.add(new du.widgets.LineChart("subchart1")
    .margins({left: 30, top: 10, right: 10, bottom: 20})
    .fontSize(10)
    .data(Array.from(new Array(100).keys()).map(function (i) {
        return {
            x: i,
            y: {
                mango: 10 * Math.pow(i / 40, 2),
                kiwi: 10 * Math.log(i + 1) * Math.pow(Math.cos(Math.PI * i / 15), 2) + 2
            }
        }
    }))
    .colors(colors), 0, 0, 1, 1);
grid.add(new du.widgets.BarChart("subchart3")
    .margins({left: 50, top: 10, right: 10, bottom: 20})
    .fontSize(10)
    .vertical(true)
    .data({
        plum: 13,
        banana: 4,
        mango: 6,
        orange: 2,
        melon: 11,
        kiwi: 7,
        pear: 3
    })
    .colors(colors), 0, 1, 2, 1);
grid.add(new du.widgets.AreaChart("subchart2")
    .margins({left: 30, top: 10, right: 10, bottom: 20})
    .fontSize(10)
    .data(Array.from(new Array(100).keys()).map(function (i) {
        return {
            x: i,
            y: {
                mango: 10 * Math.pow(i / 40, 2),
                kiwi: 10 * Math.log(i + 1) * Math.pow(Math.cos(Math.PI * i / 15), 2) + 2
            }
        }
    }))
    .colors(colors), 1, 0, 1, 1);

// Hint
new du.widgets.Hint("hint", "#hint")
    .x(70)
    .y(50)
    .text("This is a hint")
    .pin(true)
    .render();

// Histogram
new du.widgets.Histogram("histogram", "#histogram")
    .data(new Array(1000).fill(0).map(function () {
        return Math.exp(1 + Math.random() * 2);
    }))
    .width(width)
    .height(height)
    .xLabel("bins")
    .yLabel("count")
    .margins({left: 60, top: 20, right: 20, bottom: 40})
    .fontSize(12)
    .colors("dodgerblue")
    .render();

// Label
new du.widgets.Label("label", "#label")
    .width(width)
    .height(height)
    .label("&ldquo;I have a dream&rdquo;")
    .fontSize(24)
    .fontColor("dodgerblue")
    .render();

// Legend
new du.widgets.Legend("widgets.legend", "#legend")
    .x(40)
    .y(50)
    .width(200)
    .height(150)
    .labels(["plum", "banana", "mango", "orange", "melon", "kiwi", "pear"])
    .colors(colors)
    .fontSize(20)
    .twoColumns(true)
    .render();

// Line chart
new du.widgets.LineChart("linechart", "#linechart")
    .width(width)
    .height(height)
    .xLabel("days")
    .yLabel("price")
    .margins({left: 40, top: 20, right: 20, bottom: 40})
    .fontSize(12)
    .data(Array.from(new Array(100).keys()).map(function (i) {
        return {
            x: i,
            y: {
                mango: 10 * Math.pow(i / 40, 2),
                kiwi: 10 * Math.log(i + 1) * Math.pow(Math.cos(Math.PI * i / 15), 2) + 2
            },
            dy: {
                mango: i / 10,
                kiwi: 6
            }
        }
    }))
    .colors(colors)
    .render();

// Map
new du.widgets.Map("map", "#map")
    .x(0)
    .y(0)
    .width(width)
    .height(height)
    .backgroundColor("#aac6ff")
    .borderColor("white")
    .foregroundColor("#dc9a2f")
    .render();

// Picture
new du.widgets.Picture("widgets.picture", "#picture")
    .width(width)
    .height(height)
    .src("data/macika.jpg")
    .render();

// Pie chart
new du.widgets.PieChart("piechart", "#piechart")
    .x(30)
    .y(0)
    .innerRadius(30)
    .outerRadius(100)
    .margins(30)
    .fontColor("white")
    .fontSize(14)
    .ticks(true)
    .data({
        orange: 3,
        mango: 4,
        banana: 4,
        plum: 2
    })
    .colors({
        plum: "darkmagenta",
        banana: "gold",
        mango: "tomato",
        orange: "orange"
    })
    .render();

// Placeholder
new du.widgets.LineChart("placeholder", "#placeholder")
    .width(width)
    .height(height)
    .xLabel("time")
    .yLabel("trends")
    .margins({left: 40, top: 20, right: 20, bottom: 40})
    .fontSize(14)
    .data(Array.from(new Array(100).keys()).map(function (i) {
        return {
            x: i,
            y: {
                mango: 10 * Math.pow(i / 40, 2),
                kiwi: 10 * Math.log(i + 1) * Math.pow(Math.cos(Math.PI * i / 15), 2) + 2
            },
            dy: {
                mango: i / 10,
                kiwi: 6
            }
        }
    }))
    .colors(colors)
    .render()
    .placeholder("This chart is empty and you see a placeholder instead");

// Slider
new du.widgets.Slider("widgets.slider", "#slider")
    .x(10)
    .y(70)
    .width(width - 20)
    .margins({left: 40, top: 20, right: 20, bottom: 40})
    .fontSize(14)
    .render();

// Status
var st = new du.widgets.Status("status", "#status")
    .x(0)
    .y(60)
    .width(170)
    .height(50)
    .margins({left: 40, top: 20, right: 20, bottom: 40})
    .fontSize(20)
    .label("Time:")
    .value(new Date().toLocaleTimeString())
    .render();
setInterval(function () {
    st.value(new Date().toLocaleTimeString())
        .render();
}, 900);

// Trackpad
new du.widgets.TrackPad("trackpad", "#trackpad")
    .x(50)
    .y(30)
    .width(160)
    .height(160)
    .margins(30)
    .fontSize(9)
    .xRange([0, 255])
    .yRange([0, 255])
    .render();