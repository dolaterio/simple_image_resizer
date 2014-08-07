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
  opts = {
    Body: stdout,
    Bucket: bucket,
    Key: destination,
    ContentType: mime.lookup(url)
  }
  s3.putObject(opts, function(error, res){
    if(err){
      console.log(err)
      process.exit(1)
    }
    process.exit(0)
  })
});
