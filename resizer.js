var path = require('path'),
    gm = require('gm'),
    request = require('request'),
    mime = require('mime'),
    AWS = require('aws-sdk');

var width = process.argv[2];
var height = process.argv[3];
var url = process.argv[4];
var destination = process.argv[5];

if(!destination){
  console.error("Usage: node resizer.js WIDTH HEIGHT URL DESTINATION")
  process.exit(1)
}

var accessKeyId = process.env["S3_KEY"]
var secretAccessKey = process.env["S3_SECRET"]
var region = process.env["S3_REGION"]
var bucket = process.env["S3_BUCKET"]

if(!accessKeyId || !secretAccessKey || !region || !bucket){
  console.error("S3 configuration is not set.")
  process.exit(1)
}

AWS.config.update({accessKeyId: accessKeyId, secretAccessKey: secretAccessKey, region: region});
var s3 = new AWS.S3()

var reqStream = request.get({
  "uri": url,
  "encoding": null,
  "strictSSL": false,
  "timeout": 5000,
  "pool.maxSockets": 10
})

gm(reqStream)
.resize(width, height)
.stream(function (err, stdout, stderr) {
  if(err){
    console.error(err.message)
    process.exit(1)
  }
  var buf = new Buffer(0);
  stdout.on('data', function(d) {
    buf = Buffer.concat([buf, d]);
  });
  stdout.on('end', function() {
    var opts = {
      Body: buf,
      Bucket: bucket,
      Key: destination,
      ContentType: mime.lookup(url)
    }
    s3.putObject(opts, function(err, res){
      if(err){
        console.error(err.message)
        process.exit(2)
      }
      process.exit(0)
    })
  });

});
