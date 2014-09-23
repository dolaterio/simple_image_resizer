var path = require('path'),
    gm = require('gm'),
    request = require('request'),
    mime = require('mime'),
    AWS = require('aws-sdk');

function readInput(cb) {
  var input = "";
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', function() {
    var chunk = process.stdin.read()
    if (chunk) {
      input = input + chunk;
    } else if (input.length == 0) {
      // Chunk and input is empty, so there's no content in stdin. For some reason it is not triggering 'end'.
      return cb(null, new Error("Empty STDIN"))
    }
  });

  process.stdin.on('end', function() {
    try {
      input = JSON.parse(input)
    } catch(e) {
      return cb(null, new Error("Invalid JSON format for STDIN"))
    }

    var missing_fields = [];
    if (!input.width)
      missing_fields.push("width");
    if (!input.height)
      missing_fields.push("height");
    if (!input.url)
      missing_fields.push("url");
    if (!input.destination)
      missing_fields.push("destination");

    if (missing_fields.length > 0)
      return cb(null, new Error("Missing fields: " + missing_fields.join(", ")))

    cb(input)
  })
}

function resizeFile(url, width, height, cb) {
  var reqStream = request.get({
    "uri": url,
    "encoding": null,
    "strictSSL": false,
    "timeout": 5000,
    "pool.maxSockets": 10
  });

  gm(reqStream)
  .resize(width, height)
  .stream(function (err, stdout, stderr) {
    if(err)
      return cb(null, err)
    var buf = new Buffer(0);
    stdout.on('data', function(d) {
      buf = Buffer.concat([buf, d]);
    });

    stdout.on('end', function() {
      cb(buf)
    });
  });
}

function uploadFile(buffer, contentType, destination, cb) {
  var opts = {
    Body: buffer,
    Bucket: bucket,
    Key: destination,
    ContentType: contentType
  }
  s3.putObject(opts, function(err, res){
    if(err)
      return cb(null, err)
    cb(res)
  })
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

readInput(function(input, error){
  if (error) {
    console.error(error.message);
    process.exit(1)
  }

  resizeFile(input.url, input.width, input.height, function(buffer, error) {
    if (error) {
      console.error(error.message);
      process.exit(2)
    }

    uploadFile(buffer, mime.lookup(input.url), input.destination, function(res, error){
      if (error) {
        console.error(error.message);
        process.exit(3)
      }
      process.exit(0)
    });
  });
});
