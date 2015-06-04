$(document).ready(function(){
  var data = '';
  var iso2name = '';
  var keyHover = '';

  var width = 600;
  var height = 400;

  var pts = [];
  var keyLabels = [];
  var regions = [ "EAE", "ECE", "LCE", "MEE", "NAE", "SSE", "SAE", "GLE" ]; // array of which regions we want to show

  var s = function( p ) {

    var iso2color = { // set up colors for different regions
      'none': p.color(0),
      'ECE': p.color(118, 91, 160),
      'EAE': p.color(200, 70, 70),
      'LCE': p.color(20, 185, 189),
      'MEE': p.color(251, 183, 84),
      'NAE': p.color(56, 130, 166),
      'SAE': p.color(237, 125, 32),
      'SSE': p.color(216, 100, 152),
      'GLE': p.color(100)
    };

    function DataPoint(year, value, ISO){
      this.year = year;
      this.value = value;
      this.ISO = ISO;
      this.name = iso2name[this.ISO];
      this.cx = getCX(this.year);
      this.cy = getCY(this.value);
      this.color = iso2color[this.ISO];
      this.r = 6;
      this.hovered = false;
    }

    DataPoint.prototype.draw = function(){
      p.noStroke();
      if( p.mouseX <= (this.cx + this.r)
          && p.mouseX >= (this.cx - this.r)
          && p.mouseY <= (this.cy + this.r)
          && p.mouseY >= (this.cy - this.r)
      ){
        this.hovered = true;
      } else {
        this.hovered = false;
      }

      if(keyHover == '' || keyHover == this.ISO){ // check if point is part of current active region or no active region is selected
        p.fill(this.color);
      } else {
        p.fill(0,10); // if not in the selected/hovered region, draw as transparent grey
      }
      p.ellipse(this.cx, this.cy, this.r, this.r);
    }

    function PointLabel(year, value, ISO){
      this.year = year;
      this.value = value;
      this.ISO = ISO;
      this.name = iso2name[this.ISO];
      this.cx = getCX(this.year);
      this.cy = getCY(this.value);
      this.color = iso2color[this.ISO];
      this.r = 6;
      this.show = false;
    }

    PointLabel.prototype.display = function(){
      var hovered = [];
      for(var h = 0; h < pts.length; h++){ // make an array of all the points being hovered (allows us to check for overlapping points)
        if(pts[h].hovered === true){
          hovered.push(pts[h]);
        }
      }

      // check if point is being hovered, and if so, show the label
      if( p.mouseX <= (this.cx + this.r)
          && p.mouseX >= (this.cx - this.r)
          && p.mouseY <= (this.cy + this.r)
          && p.mouseY >= (this.cy - this.r)
      ){
        p.fill(255,220);
        p.textAlign(p.CENTER);
        if(hovered.length <= 1){ // if mouse is only over one dot, draw its label
          keyHover = this.ISO;
          var label = Math.round(this.value) + ' deaths per 100,000 births';
          p.rect(this.cx-37, this.cy-35, 75,30);
          p.fill(this.color);
          p.text(label,this.cx,this.cy-40, 75, 50);
        } else { // otherwise, draw the dot on top (last dot in array)
          if(this.ISO == hovered[0].ISO){ // only draw for first point so it draws only once, not for every hovered point
            keyHover = hovered[hovered.length-1].ISO;
            var label = Math.round(hovered[hovered.length-1].value) + ' deaths per 100,000 births';
            p.rect(hovered[hovered.length-1].cx-37, hovered[hovered.length-1].cy-35, 75,30);
            p.fill(hovered[hovered.length-1].color);
            p.text(label,hovered[hovered.length-1].cx,hovered[hovered.length-1].cy-40, 75, 50);
          }
        }
        if(this.ISO == hovered[0].ISO){
          drawISOLabel(keyHover);
        }
      }
    }

    function KeyLabel(ISO, x, y){
      this.ISO = ISO;
      this.name = iso2name[this.ISO];
      this.x = x;
      this.y = y;
      this.w = 150;
      this.h = 15;
      this.color = iso2color[this.ISO];
    }

    KeyLabel.prototype.draw = function(){
      p.textAlign(p.LEFT);
      p.fill(this.color);
      p.text(this.name, this.x, this.y);
    }

    p.drawRegions = function() {
      p.stroke(235);
      p.strokeWeight(1);
      p.noFill();

      // draw axes
      p.line(getCX(1995),height-50,getCX(2010) + 5,height-50);
      for(var yr = 1995; yr <= 2010; yr = yr+5){
        p.line(getCX(yr),0+50,getCX(yr),height-45);
        if(yr == 1995){
          for(var t = 0; t <= 5; t++){
            var val = 800 - (800/5)*t;
            p.line(getCX(yr)+5,getCY(val), getCX(yr)-5,getCY(val));
          }
        }
      }
      p.noStroke();
      p.fill(200);
      for(var t = 0; t <= 5; t++){
        var val = 800 - (800/5)*t;
        p.textAlign(p.RIGHT);
        p.text(val, getCX(1995)-10, getCY(val)+3);
      }
      for(var yr = 1995; yr <= 2010; yr = yr+5){
        p.textAlign(p.CENTER);
        p.text(yr, getCX(yr), height-45 + 10);
      }

      // draw each region's graph
      for (var r = 0; r < regions.length; r++){
        p.drawGraph(regions[r]);
      }

      // draw the key
      for(var r = 0; r < regions.length; r++){
        var newKeyLabel = new KeyLabel(regions[r],25, 50 + 20*r);
        keyLabels.push(newKeyLabel);
        newKeyLabel.draw();
      }

      // check if hovering over the key/selecting a region
      var hoveredLabels = 0;
      for(var k = 0; k < keyLabels.length; k++){
        if( p.mouseX <= (keyLabels[k].x + keyLabels[k].w)
            && p.mouseX >= (keyLabels[k].x - 10)
            && p.mouseY <= (keyLabels[k].y + keyLabels[k].h)
            && p.mouseY >= (keyLabels[k].y - 10)
        ){
          keyHover = keyLabels[k].ISO;
          hoveredLabels++;
        }
      }
      if(hoveredLabels == 0){ // if nothing is hovered, reset to no hover
        keyHover = '';
      } else { // otherwise, draw the label for the region being hovered over
        drawISOLabel(keyHover);
      }

      // unit label for y axis
      p.textAlign(p.RIGHT);
      p.fill(200);
      p.text('Deaths per 100,000 births', 165, height/2 + 40, 75, 30); 

      // set up labels for individual graph points
      for (var r = 0; r < regions.length; r++){
        p.drawPointLabels(regions[r]);
      }
    };

    p.drawGraph = function(ISO){
      var d = data[ISO];
      var isoPts = [];
      for (var yr in d){
        var newPt = new DataPoint(yr, d[yr], ISO);
        pts.push(newPt); // save points globally to check hovering
        isoPts.push(newPt);
      }
      
      for(var pt = 0; pt < isoPts.length; pt++){
        if(pt > 0){
          if(keyHover == '' || keyHover == ISO){
            p.stroke(isoPts[pt].color);
          } else {
            p.stroke(0,0,0,10);
          }
          p.strokeWeight(2);
          p.noFill();
          p.line(isoPts[pt-1].cx,isoPts[pt-1].cy,isoPts[pt].cx,isoPts[pt].cy); // draw connecting segments between point and previous point
        }
      }

      for(var pt = 0; pt < isoPts.length; pt++){
        isoPts[pt].draw();
      }
    }

    function drawISOLabel(ISO){
      p.textAlign(p.LEFT);
      var firstYear = '';
      for(var r = 0; r < regions.length; r++){
        if(ISO == regions[r]){
          for(var pt = 0; pt < pts.length; pt++){
            if(pts[pt].ISO == ISO && pts[pt].year == 1995){
              firstYear = pts[pt]; // save first year value to calculate % change
            }
            if(pts[pt].ISO == ISO && pts[pt].year == 2010){
              var direction = '';
              var perc = ((pts[pt].value - firstYear.value)/firstYear.value)*100; // calculate % change
              if(perc < 0){
                direction = '-';
              } else if (perc > 0){
                direction = '+';
              }
              p.fill(pts[pt].color);
              p.text(iso2name[pts[pt].ISO] + ' ' + direction + Math.abs(Math.round(perc)) + '%', pts[pt].cx + 10, pts[pt].cy - 10, 75, 30);
            }
          }
        }
      }
    }

    p.drawPointLabels = function(ISO){
      var d = data[ISO];
      var isoLabels = [];
      for (var yr in d){
        var newLabel = new PointLabel(yr, d[yr], ISO);
        isoLabels.push(newLabel);
      }
      
      for(var pt = 0; pt < isoLabels.length; pt++){
        isoLabels[pt].display();
      }
    }

    // set up scale functions
    function getCX(yr){ 
      return p.map(yr,1995,2010,0+200,width-100);
    }

    function getCY(val){
      return p.map(val,0,800,height-50,0+50);
    }

    p.preload = function(){
      data = p.loadJSON("/noceilings-data/json/MATMORTA.json"); // load the maternal mortality indicator
      iso2name = p.loadJSON("/noceilings-data/region-names.json");
      iso2name['GLE'] = 'Global'; // adding global name
    }

    p.setup = function() {
      var mm_canvas = p.createCanvas(width, height);
      mm_canvas.parent('sketch');
    };

    p.draw = function() {
      p.background(255);

      pts = [];
      p.drawRegions();
    };

  };

  $('#sketch').append('<div class="title">Globally, mothers are 42% less likely to die from complications of pregnancy than in 1995.</div>');
  $('#sketch').append('<div class="interact">Hover over the chart to see the change in maternal mortality since 1995 for each region.</div>');
  var myp5 = new p5(s);
});
