import nextConnect from 'next-connect';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import aws from 'aws-sdk';
import fs from 'fs';
import middleware from '../../../middlewares/middleware';


const upload = multer({ dest: '/tmp' });
const handler = nextConnect();

/* eslint-disable camelcase */
const {
  hostname: cloud_name,
  username: api_key,
  password: api_secret,
} = new URL(process.env.CLOUDINARY_URL);

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

handler.use(middleware);

handler.patch(upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.user) throw new Error('You need to be logged in.');
    let profilePicture;

    if (req.file) {
      /* const image = await cloudinary.uploader.upload(req.file.path, {
        width: 512,
        height: 512,
        crop: 'fill',
      });
      profilePicture = image.secure_url; */

      const params = {
        ACL: 'public-read',
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: fs.createReadStream(req.file.path),
        Key: req.file.originalname,
      };

      await s3.upload(params, (err, data) => {
        if (err) {
          console.log('Error occured while trying to upload to S3 bucket', err);
        }

        if (data) {
          fs.unlinkSync(req.file.path); // Empty temp folder
          const locationUrl = data.Location;
          console.log(`ok: ${locationUrl}`);
        }
      });
    }

    const { name, bio } = req.body;
    await req.db.collection('users')
      .updateOne(
        { _id: req.user._id },
        {
          $set: {
            ...(name && { name }),
            bio: bio || '',
            ...(profilePicture && { profilePicture }),
          },
        },
      );
    res.json({
      ok: true,
      message: 'Profile updated successfully',
      data: {
        name,
        bio,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({
      ok: false,
      message: error.toString(),
    });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
