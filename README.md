# Simple image resizer.

This project is a very simple image resizer. It takes any image from Internet, a desired width and height, and uploads the resized version to your S3 bucket.

# Configuration

In order to upload the end result, you'll need to pass the following values as __environment variables__:

+ `S3_KEY`: Your S3 key.
+ `S3_SECRET`: Your S3 secret.
+ `S3_REGION`: The region code of your bucket. If you don't know what's your code, check [Regions and endpoints](http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region) and use the code of the column titled as __Region__
+ `S3_BUCKET`: The name of your bucket.

# Input file

The resizer needs requires a json string on the stdin. The json has to be an Object looking like the following:

```json
{
    "width": 100,
    "height": 100,
    "url": "",
    "destination": ""
}
```

The values for `width` and `height` are the size of the resized image.

The `url` is the source image, an URL to any image publicly accessible.

The `destination` is the full path within your bucket where you want to store the file.

# Run it locally

You can run the converter locally. Clone this project, cd into it and `npm install`.

Then, a one-line command to run all together:

```
echo '{"width":30,"height":50,"url":"http://upload.wikimedia.org/wikipedia/commons/2/22/Turkish_Van_Cat.jpg","destination":"test.jpg"}' | node resizer.js
```

NOTE: Remember to set the environment variables with your S3 configuration.

# Run it on the cloud

At [dolater.io](http://dolater.io) we provide an environment where anyone can run jobs easily.

Create an account at [dolater.io](http://dolater.io) and create an image using dolaterio/simple-image-resizer. During the image creation, add Environment Variables with your S3 credentials.

After creating the image, go to Jobs and create a new one. In the STDIN field, type the Json file for the image to process and create the job. Our servers will run it and in a few seconds you'll get the resized image in your S3 bucket.
