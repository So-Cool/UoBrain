var vegaJSONSpec = {
  "$schema": "https://vega.github.io/schema/vega/v3.0.json",
  "width": 700,
  "height": 700,
  "padding": 5,
  "autosize": "none",

  "signals": [
    {
      "name": "labels", "value": true,
      "bind": {"input": "checkbox"}
    },
    {
      "name": "layout", "value": "tidy",
      "bind": {"input": "radio", "options": ["tidy", "cluster"]}
    },
    {
      "name": "radius", "value": 360,
      "bind": {"input": "range", "min": 20, "max": 600}
    },
    { "name": "originX", "update": "width / 2" },
    { "name": "originY", "update": "height / 2" },
    {
      "name": "tooltip",
      "value": {},
      "on": [
        {"events": "symbol:mouseover", "update": "datum"},
        {"events": "symbol:mouseout",  "update": "{}"}
      ]
    }
  ],

  "data": [
    {
      "name": "tree",
      "url": "../data/acad_tree.json",
      "transform": [
        {
          "type": "stratify",
          "key": "id",
          "parentKey": "parent"
        },
        {
          "type": "tree",
          "method": {"signal": "layout"},
          "size": [1, {"signal": "radius"}],
          "as": ["alpha", "radius", "depth", "children"]
        },
        {
          "type": "formula",
          "expr": "(300 + 360 * datum.alpha + 270) % 360",
          "as":   "angle"
        },
        {
          "type": "formula",
          "expr": "PI * datum.angle / 180",
          "as":   "radians"
        },
        {
          "type": "formula",
          "expr": "inrange(datum.angle, [90, 270])",
          "as":   "leftside"
        },
        {
          "type": "formula",
          "expr": "originX + datum.radius * cos(datum.radians)",
          "as":   "x"
        },
        {
          "type": "formula",
          "expr": "originY + datum.radius * sin(datum.radians)",
          "as":   "y"
        }
      ]
    },
    {
      "name": "links",
      "source": "tree",
      "transform": [
        { "type": "treelinks", "key": "id" },
        {
          "type": "linkpath",
          "shape": "diagonal", "orient": "radial",
          "sourceX": "source.radians", "sourceY": "source.radius",
          "targetX": "target.radians", "targetY": "target.radius"
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "color",
      "type": "sequential",
      "range": {"scheme": "magma"},
      "domain": {"data": "tree", "field": "depth"},
      "zero": true
    }
  ],

  "marks": [
    {
      "type": "path",
      "from": {"data": "links"},
      "encode": {
        "update": {
          "x": {"signal": "originX"},
          "y": {"signal": "originY"},
          "path": {"field": "path"},
          "stroke": {"value": "#ccc"}
        }
      }
    },
    {
      "type": "symbol",
      "from": {"data": "tree"},
      "encode": {
        "enter": {
          "size": {"value": 100},
          "stroke": {"value": "#fff"}
        },
        "update": {
          "x": {"field": "x"},
          "y": {"field": "y"},
          "fill": {"scale": "color", "field": "depth"}
        },
        "hover": {
          "fill": {"value": "red"}
        }
      }
    },
    {
      "type": "text",
      "from": {"data": "tree"},
      "encode": {
        "enter": {
          "text": {"field": "name"},
          "fontSize": {"value": 9},
          "baseline": {"value": "middle"}
        },
        "update": {
          "x": {"field": "x"},
          "y": {"field": "y"},
          "dx": {"signal": "(datum.leftside ? -1 : 1) * 6"},
          "angle": {"signal": "datum.leftside ? datum.angle - 180 : datum.angle"},
          "align": {"signal": "datum.leftside ? 'right' : 'left'"},
          "opacity": {"signal": "labels ? 1 : 0"}
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "enter": {
          "baseline": {"value": "bottom"},
//                "fill": {"value": "black"},
          "font": {"value": "monospace"},
          "fontSize": {"value": 17},
//                "stroke": {"value": "black"}
        },
        "update": {
          "align": {"value": "left"},
          "x": {"value": 10},
          "y": {"value": 10},
          "text": {"signal": "tooltip.description"},
          "fillOpacity": [
            {"test": "datum === tooltip", "value": 0},
            {"value": 1}
          ]
        }
      }
    }
  ]
};

var view = new vega.View(vega.parse(vegaJSONSpec))
  .renderer('svg')          // set renderer (canvas or svg)
  .initialize('#acad') // initialize view within parent DOM container
  .hover()                     // enable hover encode set processing
  .run();                      // run the dataflow and render the view
