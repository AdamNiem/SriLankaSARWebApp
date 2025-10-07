## About
This is a project made by our team during the 2025 NASA Space Apps Project. Made using Tailwind css, Nextjs, threejs, leaflet, https://jcallura.github.io/ (for topography stl model used) among other technologies. This was built on top of a fork of the [AnimateUI](https://animate-ui.com/docs) so the setup for the linter, pnpm, turbo among other is credited to that project by imskyleen (Elliot Sutton)

## Google Earth Engine Scripts Used

### Geometry used (roughly)
```javascript
var geometry: Polygon, 4 vertices
  type: Polygon
  coordinates: List (1 element)
  0: List (5 elements)
  0: [79.74343047911495,6.69408668129498]
  1: [80.2344307969914,6.69408668129498]
  2: [80.2344307969914,7.359380259469591]
  3: [79.74343047911495,7.359380259469591]
  4: [79.74343047911495,6.69408668129498]
  geodesic: false
```

### Buildingdetection
```javascript
var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(geometry)
  .filterDate('2016-01-01', '2016-12-31')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .select(['VV', 'VH']);

var collection2 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(geometry2)
  .filterDate('2024-01-01', '2024-12-31')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .select(['VV', 'VH']);

var image = collection.median(); // Or use mosaic/focalMedian for smoothing
var image2 = collection2.median(); // Or use mosaic/focalMedian for smoothing

// Threshold VV and VH to separate buildings from vegetation
var buildings = image.select('VV').gt(-8); // Bright VV → likely buildings
var vegetation = image.select('VH').gt(-16); // Bright VH → likely vegetation
var buildings2 = image2.select('VV').gt(-8); // Bright VV → likely buildings
var vegetation2 = image2.select('VH').gt(-16); // Bright VH → likely vegetation


// Amplify contrast
var contrast = buildings.subtract(vegetation);
var enhancedBuildings = contrast.gt(5); // Tune this threshold
//Map.addLayer(contrast, {min: -1, max: 1, palette: ['green', 'red']}, 'Contrast Raw');

Map.addLayer(contrast.updateMask(contrast), {min: -1, max: 1, palette: ['green', 'red']}, 'Buildings 2016');


var contrast2 = buildings2.subtract(vegetation);
var enhancedBuildings2 = contrast2.gt(5); // Tune this threshold
//Map.addLayer(contrast2, {min: -1, max: 1, palette: ['green', 'red']}, 'Contrast Raw');

Map.addLayer(contrast2.updateMask(contrast2), {min: -1, max: 1, palette: ['green', 'blue']}, 'Buildings 2025');
```

### Buildingdetection-2
```javascript
var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterDate('2016-01-01', '2016-07-31')
  .filterBounds(geometry)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .select(['VV', 'VH']);



var new_collection = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterDate('2025-01-01', '2025-07-31')
  .filterBounds(geometry)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .select(['VV', 'VH']);


var im = collection.median(); // Or use mosaic/focalMedian for smoothing
var im2 = new_collection.median();
// Threshold VV and VH to separate buildings from vegetation


var buildings = im.select('VV').gt(-8); // Bright VV → likely buildings
var vegetation = im.select('VH').gt(-15); // Bright VH → likely vegetation


var b2 = im2.select('VV').gt(-8); // Bright VV → likely buildings
var v2 = im2.select('VH').gt(-15); // Bright VH → likely vegetation

// Amplify contrast
var contrast = buildings.subtract(vegetation);
var c2 = b2.subtract(v2);
//var enhancedBuildings = contrast.gt(5); // Tune this threshold


//Map.addLayer(im.select('VV'), {min: -1, max: 1, palette: ['green', 'yellow', 'red']}, 't1');

Map.addLayer(contrast.updateMask(contrast), {min: -1, max: 1, palette: ['green', 'yellow', 'red']}, 'Building-Vegetation Contrast');
Map.addLayer(c2.updateMask(c2), {min: -1, max: 1, palette: ['green', 'yellow', 'blue']}, 'Building-Vegetation Contrast');

```
### COPERNICUS_S2_CLOUD_PROBABILITY
```javascript
var s2Sr = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');
var s2Clouds = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY');

var s2Sr_2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');
var s2Clouds_2 = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY');

var START_DATE = ee.Date('2019-01-01');
var END_DATE = ee.Date('2019-03-01');
var MAX_CLOUD_PROBABILITY = 65;
var region = geometry;
    

function maskClouds(img) {
  var clouds = ee.Image(img.get('cloud_mask')).select('probability');
  var isNotCloud = clouds.lt(MAX_CLOUD_PROBABILITY);
  return img.updateMask(isNotCloud);
}

// The masks for the 10m bands sometimes do not exclude bad data at
// scene edges, so we apply masks from the 20m and 60m bands as well.
// Example asset that needs this operation:
// COPERNICUS/S2_CLOUD_PROBABILITY/20190301T000239_20190301T000238_T55GDP
function maskEdges(s2_img) {
  return s2_img.updateMask(
      s2_img.select('B8A').mask().updateMask(s2_img.select('B9').mask()));
}


// Filter input collections by desired data range and region.
var criteria = ee.Filter.and(
    ee.Filter.bounds(region), ee.Filter.date(START_DATE, END_DATE));
    
    
s2Sr = s2Sr.filter(criteria).map(maskEdges);
s2Clouds = s2Clouds.filter(criteria);

// Join S2 SR with cloud probability dataset to add cloud mask.
var s2SrWithCloudMask = ee.Join.saveFirst('cloud_mask').apply({
  primary: s2Sr,
  secondary: s2Clouds,
  condition:
      ee.Filter.equals({leftField: 'system:index', rightField: 'system:index'})
});


// Function to calculate and add NDVI
function addNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands(ndvi);
}


var s2CloudMasked =
    ee.ImageCollection(s2SrWithCloudMask)
    .map(addNDVI)
    .map(maskClouds)
    .median();
var rgbVis = {min: 0, max: 3000, bands: ['B4', 'B3', 'B2']};



Map.centerObject(geometry, 10);
// Map.addLayer(
//     s2CloudMasked, rgbVis, 'S2 SR masked at ' + MAX_CLOUD_PROBABILITY + '%',
//     true);
Map.addLayer(s2CloudMasked, {min: 0, max: 1,bands: ['NDVI'],palette: ['white', 'green']}, 'NDVI 2016');

print('Band names:', s2CloudMasked.bandNames());



///




var START_DATE_2 = ee.Date('2025-01-01');
var END_DATE_2 = ee.Date('2025-03-01');
var MAX_CLOUD_PROBABILITY = 65;
var region = geometry;
    



// Filter input collections by desired data range and region.
var criteria_2 = ee.Filter.and(
    ee.Filter.bounds(region), ee.Filter.date(START_DATE, END_DATE));
    
s2Sr_2 = s2Sr.filter(criteria_2).map(maskEdges);
s2Clouds_2 = s2Clouds.filter(criteria_2);

// Join S2 SR with cloud probability dataset to add cloud mask.
var s2SrWithCloudMask_2 = ee.Join.saveFirst('cloud_mask').apply({
  primary: s2Sr_2,
  secondary: s2Clouds_2,
  condition:
      ee.Filter.equals({leftField: 'system:index', rightField: 'system:index'})
});




var s2CloudMasked_2 =
    ee.ImageCollection(s2SrWithCloudMask_2)
    .map(addNDVI)
    .map(maskClouds)
    .mean();
    
    
var rgbVis = {min: 0, max: 3000, bands: ['B4', 'B3', 'B2']};




// Map.addLayer(
//     s2CloudMasked_2, rgbVis, 'S2 SR masked at ' + MAX_CLOUD_PROBABILITY + '%',
//     true);
Map.addLayer(  s2CloudMasked_2, {min: 0, max: 1,bands: ['NDVI'],palette: ['white', 'green']}, 'NDVI 2025');
```
### NDVI
```javascript

// var dataset = ee.ImageCollection('MODIS/061/MOD13A2')
//                   .filter(ee.Filter.date('2000-01-01', '2025-12-30'))
//                   .map(function(image) {
//           //var edge = image.lt(-30.0);
//           //var maskedImage = image.mask().and(edge.not());
//           //var res = image.normalizedDifference(['VV','VH']).rename('test')
//           return image
//                 .clip(geometry);
          
//         });
                  
// var ndvi = dataset.select('NDVI');


// var ndvi_2000 = dataset.filter(ee.Filter.date('2000-01-01', '2001-04-30'));
// var ndvi_2025 = dataset.filter(ee.Filter.date('2025-01-01', '2025-04-30'));

// var ndviVis = {
//   min: 0,
//   max: 9000,
//   palette: [
//     'ffffff', 'ce7e45', 'df923d', 'f1b555', 'fcd163', '99b718', '74a901',
//     '66a000', '529400', '3e8601', '207401', '056201', '004c00', '023b01',
//     '012e01', '011d01', '011301'
//   ],
// };


// Map.centerObject(geometry, 13);
// Map.addLayer(ndvi, ndviVis, 'NDVI');



// Sentinal S1

// Define your area of interest

// Load an image collection (e.g., Sentinel-2 NDVI)
var c1 = ee.ImageCollection('COPERNICUS/S2')
  .filterBounds(geometry)
  .filterDate('2017-04-01', '2017-05-30')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
  .map(function(img) {
    return img.normalizedDifference(['B8', 'B4']).rename('NDVI');
  });

// Reduce using mean
var im1 = c1.reduce(ee.Reducer.mean());


var c2 = ee.ImageCollection('COPERNICUS/S2')
  .filterBounds(geometry)
  .filterDate('2025-04-01', '2025-05-30')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
  .map(function(img) {
    return img.normalizedDifference(['B8', 'B4']).rename('NDVI');
  });

var im2 = c2.reduce(ee.Reducer.mean());

// Display result
Map.centerObject(geometry, 10);
Map.addLayer(im2, {min: 0, max: 1, palette: ['white', 'green']}, 'im2');
Map.addLayer(im1, {min: 0, max: 1, palette: ['white', 'green']}, 'im1');
```
### S2_data
```javascript
/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 */
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.divide(10000);
}

var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterDate('2021-06-4', '2021-06-5')
                  .filterBounds(geometry2)
                  // Pre-filter to get less cloudy granules.
                  //.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  //.map(maskS2clouds);

var ds = dataset.map(maskS2clouds);

var visualization = {
  min: 0.0,
  max: 0.8,
  bands: ['B4', 'B3', 'B2'],
};

Map.centerObject(geometry, 9);

Map.addLayer(dataset, visualization, 'RGB');




// print state time

var dates = dataset.aggregate_array('system:time_start')
  .map(function(d) {
    return ee.Date(d).format('YYYY-MM-dd HH:MM');
  });

print( dates);
```
### SaveFind_passesAsImg
```javascript
// Define the region of interest (your polygon)
var geometry = ee.Geometry.Polygon(
  [[[79.7351907330212, 6.884999027623245],
    [80.06070948351484, 6.884999027623245],
    [80.06070948351484, 7.225205247225615],
    [79.7351907330212, 7.225205247225615],
    [79.7351907330212, 6.884999027623245]]],
  null, false
);

// Load Sentinel-1 ImageCollection
var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
  .filterDate('2021-04-01', '2021-07-20')
  .filterBounds(geometry);

// Print available image dates
var dates = collection.aggregate_array('system:time_start')
  .map(function(d) {
    return ee.Date(d).format('YYYY-MM-dd');
  });
print('Image dates:', dates);

// Center map and show first image
Map.centerObject(geometry, 11);
Map.addLayer(collection.first().clip(geometry), {bands:['VV'], min:-20, max:0}, 'First image');

// ----------------------------------------------------
// EXPORT EACH IMAGE IN THE COLLECTION
// ----------------------------------------------------

// Convert the ImageCollection to a list so we can iterate with client-side loop
var listOfImages = collection.toList(collection.size());

// Loop over each image and create an export task
var n = listOfImages.size().getInfo();  // bring just the count to client
print('Number of images:', n);

for (var i = 0; i < n; i++) {
  var img = ee.Image(listOfImages.get(i));
  var date = ee.Date(img.get('system:time_start')).format('YYYY-MM-dd');
  var filename = ee.String('S1_').cat(date);

  Export.image.toDrive({
    image: img.clip(geometry).select('VV'),
    description: filename.getInfo(),    // description must be client-side
    folder: 'GEE_Sentinel1_Exports',
    fileNamePrefix: filename.getInfo(),
    region: geometry,
    scale: 10,
    crs: 'EPSG:4326',
    maxPixels: 1e13
  });
}
```
### basic_SAR
```javascript
/* COPERNICUS/S1_GRD hasith@fos.cmb.ac.lk new
*/
var img_s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
        .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
        .filter(ee.Filter.eq('instrumentMode', 'IW'))
        //.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING')
        .filterDate('2016', '2024')
        .filterBounds(geometry)

      
        .map(function(image) {
          //var edge = image.lt(-30.0);
          //var maskedImage = image.mask().and(edge.not());
          //var res = image.normalizedDifference(['VV','VH']).rename('test')
          return image
               // .addBands(res)
               // .updateMask(maskedImage)
                .clip(geometry);
          
        });

/*
// sentinal 2 collection 
var img_s2 = ee.ImageCollection('COPERNICUS/S2')
        .filterDate('2018-01-01', '2019-01-04')
        .filterBounds(geometry)
        .map(function(image) {
          var res = image.normalizedDifference(['B3','B8']).rename('NDWI')
          return image
                //.updateMask(maskedImage)
                .addBands(res)
                .clip(geometry);
          
        });
*/

// Add the first image to the map, just as a preview.
Map.centerObject(geometry,12);
//Map.addLayer(img_s1.select(['VV','VH','test']).first(),{bands:['VV','VV','test']},'test s2' )

var test_img_s1 = ee.Image('COPERNICUS/S1_GRD/S1A_IW_GRDH_1SDV_20170112T002445_20170112T002510_014791_018174_E5C6')
//var test_img_s1 = ee.Image('COPERNICUS/S1_GRD/S1A_IW_GRDH_1SDV_20171027T002454_20171027T002519_018991_020197_760C')
.clip(geometry)
Map.addLayer(test_img_s1.select('VV'),{min:-30,max:0},'unprocessed')

var asc_img_s1 = ee.Image('COPERNICUS/S1_GRD/S1A_IW_GRDH_1SDV_20171027T124930_20171027T124955_018999_0201D3_3473')
.clip(geometry)



var training = test_img_s1.select('VV').sample({
  region: geometry,
  scale: 10,
  numPixels: 10000
});
var training_asc =asc_img_s1.select('VV').sample({
  region: geometry,
  scale: 10,
  numPixels: 10000
});


var clusterer_2 = ee.Clusterer.wekaKMeans(4).train(training_asc);
var result_asc = asc_img_s1.select('VV').cluster(clusterer_2);


var clusterer = ee.Clusterer.wekaKMeans(4).train(training);
var result = test_img_s1.select('VV').cluster(clusterer);



Map.addLayer(result.randomVisualizer(), {}, 'clusters-desc');
Map.addLayer(result.select('cluster').eq(2), {}, 'clusters_decs-BW');

Map.addLayer(result_asc.randomVisualizer(), {}, 'clusters-asc');
Map.addLayer(result_asc.select('cluster').eq(2), {}, 'clusters_asc-BW');

var desc = img_s1.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));
var asc = img_s1.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));

var filt = desc
          .map(function(image) {
          var result = image.cluster(clusterer);
          var thrsh = result.select('cluster').eq(2)
          .rename('ahe');
         
          return image
                .addBands(thrsh)
        });
var filt_asc = asc
          .map(function(image) {
          var result = image.cluster(clusterer_2);
          var thrsh = result.select('cluster').eq(2)
          .rename('ahe_asc');
         
          return image
                .addBands(thrsh)
        });




Map.addLayer(filt.select('ahe').mean(),{palette:['white','Red','black'],min:0,max:1},'map_desc')
Map.addLayer(filt_asc.select('ahe_asc').mean(),{palette:['white','blue','black'],min:0,max:1},'map_asc')
//print(asc)

/*
var thumb2 = ui.Thumbnail({
  // Specifying a collection for "image" animates the sequence of images.
  image: filt.select('ahe'),
  params: {
  //crs: 'EPSG:3857',  // Maps Mercator
  dimensions: '320',
  region: geometry,
  palette: 'blue,yellow',
  min :0 ,
  max : 1,
  framesPerSecond: 30,
  },
  style: {
    position: 'bottom-right',
    width: '320px'
  }
  });
Map.add(thumb2);

*/

var vol = ui.Chart.image.series(filt.select('ahe'), geometry, ee.Reducer.sum())
          .setOptions({ title: 'Water serface area-desc vs t',
              lineWidth: 1})
          .setChartType('ScatterChart')
print(vol)

var vol_asc = ui.Chart.image.series(filt_asc.select('ahe_asc'), geometry, ee.Reducer.sum())
          .setOptions({ title: 'Water serface area-asc vs t',
              lineWidth: 1})
          .setChartType('ScatterChart')
print(vol_asc)
// Visualization parameters.

/*
var args = {
  crs: 'EPSG:3857',  // Maps Mercator
  dimensions: '320',
  region: geometry,
  min: -1,
  max: 1,
  palette: 'black, red, yellow',
  framesPerSecond: 12,
};


var thumb = ui.Thumbnail({
  // Specifying a collection for "image" animates the sequence of images.
  image: img_s2.select('NDWI'),
  params: args,
  style: {
    position: 'bottom-right',
    width: '320px'
  }});

Map.add(thumb);

*/


//final thumbnale viewing
/*
var thumb1 = ui.Thumbnail({
  // Specifying a collection for "image" animates the sequence of images.
  image: img_s1.select('VV'),
  params: {
  //crs: 'EPSG:3857',  // Maps Mercator
  dimensions: '320',
  region: geometry,
  palette: 'black,blue,green, red, yellow',
  min :-30 ,
  max : 0,
  framesPerSecond: 12,
  },
  style: {
    position: 'bottom-left',
    width: '320px'
  }
  });


//Map.add(thumb);

var thumb2 = ui.Thumbnail({
  // Specifying a collection for "image" animates the sequence of images.
  image: img_s1.select('test'),
  params: {
  //crs: 'EPSG:3857',  // Maps Mercator
  dimensions: '320',
  region: geometry,
  palette: 'black,blue,green, red, yellow',
  min :-30 ,
  max : 0,
  framesPerSecond: 12,
  },
  style: {
    position: 'bottom-center',
    width: '320px'
  }
  });
//Map.add(thumb);
*/
/* //Kmeans - didnt work
var km_lbl = ee.Algorithms.Image.Segmentation.GMeans({
  image: test_img_s1,
   //numClusters: 100,
   numIterations: 1000, 
   neighborhoodSize: 1 ,
    //gridSize:5,// forceConvergence, uniqueLabels
});

Map.addLayer(km_lbl,{},'Kmns')
print(km_lbl)
*/
/*
Export.table.toDrive({
  collection: featureCollection,
  description: 'exportTableExample',
  fileFormat: 'CSV'
});
*/

var thumb2 = ui.Thumbnail({
  // Specifying a collection for "image" animates the sequence of images.
  image: filt.select('ahe'),
  params: {
  //crs: 'EPSG:3857',  // Maps Mercator
  dimensions: '320',
  region: geometry,
  palette: 'blue,yellow',
  min :0 ,
  max : 1,
  framesPerSecond: 30,
  },
  style: {
    position: 'bottom-right',
    width: '320px'
  }
  });
  
  
var thumb1 = ui.Thumbnail({
  // Specifying a collection for "image" animates the sequence of images.
  image: filt_asc.select('ahe_asc'),
  params: {
  //crs: 'EPSG:3857',  // Maps Mercator
  dimensions: '320',
  region: geometry,
  palette: 'blue,yellow',
  min :0 ,
  max : 1,
  framesPerSecond: 30,
  },
  style: {
    position: 'bottom-left',
    width: '320px'
  }
  });
  
  
Map.add(thumb1);
Map.add(thumb2);

```
### find_passes
```javascript


var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
        .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
        //.filter(ee.Filter.eq('instrumentMode', 'IW'))
        .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
        //.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'))
        .filterDate('2021-04-01', '2021-7-20')
        .filterBounds(geometry)
        



// Smooth the data to remove noise.
var SMOOTHING_RADIUS_METERS = 30;
// Filter by date (before and after)

var pre = collection.filterDate('2021-04-01', '2021-05-01')
    .mosaic()
    .focalMin(SMOOTHING_RADIUS_METERS, 'circle', 'meters')
    //.rename('pre');

var event = collection.filterDate('2021-6-01', '2021-6-20')
    .mosaic()
    .focalMin(SMOOTHING_RADIUS_METERS, 'circle', 'meters')
    //.rename('event');
    
// var post_1 = collection.filterDate('2021-6-30', '2021-7-30')
//     .mosaic()
//     .focalMin(SMOOTHING_RADIUS_METERS, 'circle', 'meters');

var pre_filter = collection.filterDate('2021-04-01', '2021-05-01')

var lastimg=pre_filter.limit(1, 'system:time_start',false).first();


var dates = pre_filter.aggregate_array('system:time_start')
  .map(function(d) {
    return ee.Date(d).format('YYYY-MM-dd');
  });

print('Image dates:', dates);


var combined = pre.addBands(event)

var bandNames = combined.bandNames();
print('Band Names:', bandNames);



var imageIDs = pre_filter.map(function(image) {
  return ee.Feature(null, {id: image.id()});
});

// Print the list of image IDs
print('Image IDs:', imageIDs);



var img_s1 = ee.Image('COPERNICUS/S1_GRD/S1A_IW_GRDH_1SDV_20210409T002510_20210409T002535_037366_046740_CE08')
.clip(geometry)




Map.centerObject(geometry2, 14);  // display our AOI at zoom level 13


Map.addLayer(img_s1,{bands: ['VH',],min:-40,max:0},'raw-SAR')
Map.addLayer(pre.clip(geometry), {bands: ['VH',],min: -40, max: 10}, 'before-filtered');
Map.addLayer(event.clip(geometry), {bands: ['VH'],min: -40, max: 10}, 'event-filtered');
Map.addLayer(combined.clip(geometry), {bands: ['VH','VH_1','VH'],min: -40, max: 10,}, 'Combineded map');





var preFloodTiles = combined.getMap({bands: ['VH','VH_1','VH'],min: -40, max: 10,});
print("Combined map export:",preFloodTiles.urlFormat);

var preFloodTiles = img_s1.getMap({bands:['VH'] ,min:-40,max:10});
print("raw data export:",preFloodTiles.urlFormat);
```


## Authors
Hasith Perera, Breckenridge Alexander, Brayden Knight, Brendon Harmon, Adam Niemczura, Will Long

## License
Licensed under the MIT license
