/**
 * @PieBar Chart 
 * @author 汤尧<tangyao@alibaba-inc.com>
 * @module PieBar
 **/
KISSY.add(function (S, Node,Base) {

  var EMPTY = '';
  var $ = Node.all;
  var D = S.DOM;
  var NONE = 'none';
  var _container; // 画布容器
  var _width; // 画布宽
  var _height; // 画布高
  var _paper; // 画布
  var _bar_max = 80; // 柱形图最高值
  var _total = 360; // 圆形总份数
  var _rad = Math.PI / 180;
  var _cx, _cy, _cr = 40, _c_fill = '#e67d61'; // 圆心, 圆心半径 天猫红
  var _pie_r = 250; // 饼图参考半径 一般来说是容器最小边上 -200
  var _result = []; // 计算完成后的数据结果
  var _set_chart; // 元素集合 paper.set()
  var _center = {}; // 中心元素
  var _tdata; // 数据
  var _avgms; // 每个小的扇形动画持续时间
  var _tip; // tip
  var _mapping = {
    label: {
      color: '#666666',
      hover: '#000000'
    },
    pie: {
      name: '流量',
      attr: 'pv',
      color: '#8cc63e', 
      hover: '#066839',
      defaultColor: '#d3d3d3',
      defaultHover: '#b1d747'
    },
    bar1: {
      name: '成交金额',
      attr: 'gmv',
      color: '#f7941d',
      hover: '#ef3e38'
    },
    bar2: {
      name: '用户',
      attr: 'uv',
      color: '#00adef',
      hover: '#1176ba'
    }
  };
  var _set_center; // 圆心集合
  var _center_click = function (center) {}; // 圆心点击事件
  var _leaf_click = function (leaf) {}; // 叶子点击事件

  // 找出每一项最大值，算出其他值与最大值的比例
  function caculate(tdata) {
    _tdata = tdata;
    var length = tdata.length;
    var pieVal = 0;
    var bar1Val = 0;
    var bar2Val = 0;
    // var result = [];
    for (var i = 0; i < length; i++) {
      var item = tdata[i];
      if (item.type === 1) {
        _center = item;
        continue;
      }
      pieVal = Math.max(item[_mapping.pie.attr], pieVal);
      bar1Val = Math.max(item[_mapping.bar1.attr], bar1Val);
      bar2Val = Math.max(item[_mapping.bar2.attr], bar2Val);
    }
    var avg = _total / (length - 1);
    for (i = 0; i < length; i++) {
      var item = tdata[i];
      if (item.type === 1) {
        continue;
      }
      // 流量，UV，成交，每个会场的位置，每个会场的名称
      var _this = [
        item[_mapping.pie.attr] / pieVal,
        item[_mapping.bar1.attr] / bar1Val, 
        item[_mapping.bar2.attr] / bar2Val,
        avg,
        item.label,
        i
      ];
      _result.push(_this);
    }
    // 如果数据总数大于45则取消延迟动画，否则由于总数太大，动画效果会打折扣
    if (_result.length >  45) {
      _avgms = 0;
    } else {
      _avgms = 1500 / _result.length;
    }
    
  }

  String.prototype.reverse = function () {
    return this.split('').reverse().join('');
  }
  var NumberFormat = function (number) {
    number = parseFloat(number) || 0;
    var block = String(number).split('.');
    var rs = block[0].reverse().replace(/(\d{3})/g, '$1,').reverse() + (block[1] ?  ('.' + block[1]) : '');
    if (rs.indexOf(',') === 0) {
      rs = rs.substring(1);
    }
    return rs;
  };

  // 绘制图形队列，按顺序绘制
  var Task = {
    queue: [],
    done: false,
    add: function (exe) {
      var self = this;
      this.queue.push(function (callback) {
        exe().startAnimate(callback);
      });
    },
    execute: function () {
      var self = this;
      var fun = this.queue.shift();
      self.done = false; 
      if (!fun) {
        self.done = true;
        return;
      }
      fun(function () {
        window.setTimeout(function () {
          self.execute() 
        });
      });
    }
  };

  // 定义绘制扇形路径，raphael 将会根据动画计算得到的帧数来调用该函数
  function defineArc() {
    _paper.customAttributes.arc = function (x, y, r, startAngle, endAngle) {
       var x1 = x + r * Math.cos(-startAngle * _rad),
        x2 = x + r * Math.cos(-endAngle * _rad),
        y1 = y + r * Math.sin(-startAngle * _rad),
        y2 = y + r * Math.sin(-endAngle * _rad);
      var end = ["M", x, y, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, 'Z'];
      _set_center.toFront();
      return {path: end};
    };
  }

  function sector(r, startAngle, endAngle, params) {
    params['arc'] = [_cx, _cy, r, startAngle, startAngle];
    var path = _paper.path().attr(params);
    path._animate = [{arc: [_cx, _cy, r, startAngle, endAngle]}, _avgms, 'linear'];
    return path;
  }

  /**
   * 
   * @class PieBar
   * @constructor
   * @extends Base
   */
  function PieBar(config) {
    // this.destroy();
    _container = S.get('#' + config.holder);
    _width = D.width(_container);
    _height = D.height(_container);
    _cx = _width / 2;
    _cy = _height / 2;
    _paper = Raphael(_container, _width, _height);
    defineArc();
    _set_chart = _paper.set();
    _set_center = _paper.set();
    this.rebuild(config);
    this.drawTip();
  }
  S.extend(PieBar, Base, /** @lends Demo.prototype*/{
    rebuild: function (config) {
      if (config) {
        _mapping = config.mapping || _mapping;
        _center_click = config.onCenterClick || _center_click;
        _leaf_click = config.onLeafClick || _leaf_click;
        config.data && (_result = []) && caculate(config.data);
      }
      this.render();
    },
    render: function () {
      this.destroy();
      // 绘制图例
      this.drawLegend();
      // 绘制中心圆
      this.drawCenter();
      // 绘制分会场数据
      this.drawWrap();
    },
    drawTip: function () {
      _tip = $('<ul style="position:absolute;display:none;background:#fff;filter:alpha(opacity=90);-moz-opacity:.9;-khtml-opacity:.9;opacity:.9;-moz-border-radius:4px;-webkit-border-radius:4px;border-radius:4px;padding:2px 4px;color:#666;font-family:Microsoft Yahei;z-index:10;font-size:12px;font-weight:bolder;border:1px solid;-webkit-transition: all .2s ease-in-out;-o-transition: all .5s ease-in-out;-moz-transition: all .2s ease-in-out;transition: all .2s ease-in-out;"></ul>');
      $(_container).append(_tip);
    },
    setTipContent: function (item, e) {
      var html = '<li style="font-weight:400;list-style:none;">' + item.label + '</li>';
      for (var key in _mapping) {
        var obj = _mapping[key];
        if (!obj.name) {
          continue;
        }
        html += '<li style="font-weight:400;list-style:none;"><span style="color:' + obj.color + '">' + obj.name + ': ' + NumberFormat(item[obj.attr]) + '</span></li>';
      }
      _tip.html(html);
      _tip.css({left: e.x + 'px', top: e.y + 'px', display: 'block'});
    },
    hideTip: function () {
      _tip.css({display: 'none'});
    },
    drawLegend: function () {
      var mx = _cx + _pie_r;
      var x1 = mx +  (_width - mx) / 4;
      var y1 = (_cy - _pie_r) / 2 - 20;
      for (var key in _mapping) {
        var item = _mapping[key];
        if (!item.name) {
          continue;
        }
        _paper.rect(x1, y1 += 20, 16, 8, 3).attr({fill: item.color, stroke: '#f0f0f0'});
        _paper.text(x1 + 20, y1 + 4, item.name).attr({fill: item.color, stroke: NONE, 'font-size': 12, 'text-anchor': 'start'});
      }
    },
    drawCenter: function () {
      _set_center.push(_paper.circle(_cx, _cy, _cr).attr({stroke: NONE, fill: _c_fill}));
      _set_center.push(_paper.text(_cx, _cy, _center.label).attr({fill: '#fff', 'font-size': 18}));
      _set_center.click(function () {
        _center_click(_center);
      });
    },
    drawWrap: function () {
      var self = this;
      var angle = 0;
      var start = 0;

      function process(j) {
        var item = _result[j]
        var value = item[3];
        var angleplus = 360 * value / _total;
        var popangle = angle + (angleplus / 2);
        var color = Raphael.hsb(start, .75, 1);
        var ms = 500;
        var delta = 5;
        var bcolor = Raphael.hsb(start, 1, 1);
        
        //     
        var _r = item[0] * (_pie_r - _cr) + _cr;
        var p = sector(_pie_r, angle, angle + angleplus, {fill: _mapping.pie.defaultColor, stroke: _mapping.pie.defaultColor, "stroke-width": 0.05});
        var _p = sector(_r, angle, angle + angleplus, {fill: _mapping.pie.color, stroke: "#000", "stroke-width": 0.05});
        
        var bar1Height = _bar_max * item[1];
        var bar2Height = _bar_max * item[2];
        var dis = Math.max(bar1Height, bar2Height) + 4;
        // console.log(dis, item[4]);
        var px = _cx + (_pie_r + delta) * Math.cos(-popangle * _rad);
        var py = _cy + (_pie_r + delta) * Math.sin(-popangle * _rad);
        var tx = _cx + dis + (_pie_r + delta) * Math.cos(-popangle * _rad);
        // var ty = cy + (r + delta + dis) * Math.sin(-popangle * rad);
        var kuan = 4;
        py -= kuan;
        var txt = _paper.text(tx, py, item[4]).attr({
            fill: _mapping.label.color, 
            stroke: "none", 
            opacity: 1, 
            "font-size": 12,
            "text-anchor": "start"
            ,"transform": "r" + (360 - popangle)  + ',' + px + ',' + py
        });
        // console.log(popangle);

        var setx = _paper.set();
        
        var bar1 = _paper.path(['M', px, py, 'L', px + bar1Height, py, 'L', px + bar1Height, py + kuan, 'L', px, py + kuan, 'Z'])
        .attr({fill: _mapping.bar1.color, stroke: 'none', opacity: 0});//
        py += kuan;

        var bar2 = _paper.path(['M', px, py, 'L', px + bar2Height, py, 'L', px + bar2Height, py + kuan, 'L', px, py + kuan, 'Z'])
        .attr({fill: _mapping.bar2.color, 'stroke': 'none', opacity: 0});

        // setx.push(txt);
        setx.push(bar1);
        setx.push(bar2);
        setx.attr({
          opacity: 1
          ,"transform": "r" + (360 - popangle) + ',' + px + ',' + py
        });

        function mouseover(e) {
          if (!Task.done) {
            return;
          }
          p.stop().animate({transform: "s1.01 1.01 " + _cx + " " + _cy, fill: _mapping.pie.defaultHover}, ms, "elastic");
          setx.stop().animate({}, ms, "elastic");
          txt.attr({fill: _mapping.label.hover, "font-size": 16});
          bar1.attr({fill: _mapping.bar1.hover});
          bar2.attr({fill: _mapping.bar2.hover});
          _p.attr({fill: _mapping.pie.hover});

          self.setTipContent(_tdata[item[5]], e);
        }

        function mouseout() {
          if (!Task.done) {
            return;
          }
          var obj = p.stop();
          if (obj) {
            obj.animate({transform: "", fill: _mapping.pie.defaultColor}, ms, "elastic");
          }
          txt.attr({fill: _mapping.label.color, "font-size": 12});
          bar1.attr({fill: _mapping.bar1.color});
          bar2.attr({fill: _mapping.bar2.color});
          _p.attr({fill: _mapping.pie.color});

          self.hideTip();
        }

        function leafClick() {
            _leaf_click(_tdata[item[5]]);
        }

        p.mouseover(mouseover).mouseout(mouseout).click(leafClick);
        _p.mouseover(mouseover).mouseout(mouseout).click(leafClick);

        _set_chart.push(p);
        _set_chart.push(txt);
        _set_chart.push(bar1);
        _set_chart.push(bar2);
        _set_chart.push(_p);
        angle += angleplus;
        start += .1;

        // 
        p.startAnimate = function (callback) {
          p._animate.push(function () {
            callback();
          });
          _p.animate.apply(_p, _p._animate);
          p.animate.apply(p, p._animate);
        }
        return p;
      }
  

      for (var i = 0, ii = _result.length; i < ii; i++) {
        (function (__i) {
          Task.add(function () {
            return process(__i);
          });
        })(i);
      }
      Task.execute();
    },
    destroy:function () {
      _paper.clear();
      _set_center.clear();
    }
  }, {ATTRS : /** @lends Demo*/{

  }});
  return PieBar;
}, {requires:['node', 'base', 'gallery/kcharts/1.2/raphael/']});