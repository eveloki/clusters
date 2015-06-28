function kmeans(data, config) {
  // defaults for iterations and number of clusters
  var config = config || {};
  var iterations = config.iterations || Math.pow(10,4);
  var k = config.k || Math.round(Math.sqrt(data.length / 2));

  // initialize point objects with data
  points = data.map(function(vector) { return new Point(vector) });

  // intialize centroids randomly
  var centroids = [];
  var bounds = getBounds(points.map(function(point){ return point.location() }));
  for (var i = 0; i < k; i++) {
    centroids.push(new Centroid(bounds.map(function(range, j) {
      return (Math.random() * (range.max - range.min) + range.min);
    })));
  };
  centroids.forEach(function(centroid, index) { centroid.label(index) });

  // update labels and centroid locations until convergence
  for (var iter = 0; iter < iterations; iter++) {
    points.forEach(function(point) { point.updateLabel(centroids) });
    centroids.forEach(function(centroid) { centroid.updateLocation(points) });
  };

  // return something with point labels, or the clusters
  points.forEach(function(p){
    console.log(p.label(), p.location())
  })
  centroids.forEach(function(c){
    console.log(c.label(),c.location())
  })
  return points;
};

// objects
function Point(location) {
  var self = this;
  this.location = getterSetter(location);
  this.label = getterSetter();
  this.updateLabel = function(centroids) {
    var distancesSquared = centroids.map(function(centroid) {
      return sumOfSquareDiffs(self.location(), centroid.location());
    });
    this.label(mindex(distancesSquared));
  };
};

function Centroid(initialLocation, label) {
  var self = this;
  this.location = getterSetter(initialLocation);
  this.label = getterSetter(label);
  this.updateLocation = function(points) {
    var pointsWithThisCentroid = points.filter(function(point) { return point.label() == self.label() });
    if (pointsWithThisCentroid.length > 0) self.location(averageLocation(pointsWithThisCentroid));
  };
};

// convenience functions
function getterSetter(initialValue) {
  var thingToGetSet = initialValue;
  return function(newValue) {
    if (typeof newValue === 'undefined') return thingToGetSet;
    thingToGetSet = newValue;
  };
};

function sumOfSquareDiffs(oneVector, anotherVector) {
  var squareDiffs = oneVector.map(function(component,i) {
    return Math.pow(component - anotherVector[i], 2);
  });
  return squareDiffs.reduce(function(a, b) { return a + b }, 0);
};

function mindex(array) {
  var min = array.reduce(function(a, b) {
    return Math.min(a, b);
  });
  return array.indexOf(min);
};

function getBounds(points) {
  var bounds = points[0].map(function(component) {
    return {min: component, max: component};
  });

  points.forEach(function(x_i) {
    x_i.forEach(function(component, j) {
      if (component < bounds[j].min) bounds[j].min = component;
      if (component > bounds[j].max) bounds[j].max = component;
    });
  });
  return bounds;
};

function sumVectors(a, b) {
  return a.map(function(val, i) { return val + b[i] });
};

function averageLocation(points) {
  var zeroVector = points[0].location().map(function() { return 0 });
  var locations = points.map(function(point) { return point.location() });
  var vectorSum = locations.reduce(function(a, b) { return sumVectors(a, b) }, zeroVector);
  return vectorSum.map(function(val) { return val / points.length });
};
