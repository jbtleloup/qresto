import nextConnect from 'next-connect';
import multer from 'multer';
import sharp from 'sharp';
import aws from 'aws-sdk';
import fs from 'fs';
import { ObjectID } from 'mongodb';
import middleware from '../../middlewares/middleware';

const handler = nextConnect();
handler.use(middleware);

handler.delete(async (req, res) => {
  try {
    if (!req.user) throw new Error('You need to be logged in.');
    const { id } = req.query;
    await req.db.collection('users')
      .updateOne(
        { _id: req.user._id },
        {
          $pull: {
            dishes: {
              _id: {
                $eq: new ObjectID(id),
              },
            },
          },
        },
      );
    res.json({
      ok: true,
      message: 'Dish Deleted Successfully',
    });
  } catch (error) {
    console.log(error);
    res.json({
      ok: false,
      message: error.toString(),
    });
  }
});

const upload = multer({ dest: '/tmp' });
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

async function saveDishInUser(req, dish) {
  await req.db.collection('users')
    .updateOne(
      { _id: req.user._id },
      {
        $push: {
          dishes: {
            $each: [dish],
            $sort: { title: 1 },
          },
        },
      },
    );
  await req.db.collection('users')
    .createIndex({
      'dishes.title': 1,
    });
}

async function updateDishInUser(req, dish) {
  await req.db.collection('users')
    .updateOne(
      {
        _id: req.user._id,
        'dishes._id': new ObjectID(dish.id),
      },
      {
        $set: {
          'dishes.$.title': dish.title,
          'dishes.$.description': dish.description,
          'dishes.$.ingredients': dish.ingredients,
          'dishes.$.picture': dish.picture,
        },
      },
    );
}

handler.post(upload.single('dishPicture'), async (req, res) => {
  try {
    if (!req.user) throw new Error('You need to be logged in.');
    let picture;
    const { title, description, ingredients } = req.body;
    const dish = {
      _id: await new ObjectID(),
      title,
      description,
      ingredients,
      picture,
    };
    if (req.file) {
      const image = await sharp(req.file.path)
        .resize(450, 300)
        .png({ quality: 80 })
        .toBuffer();
      const params = {
        ACL: 'public-read',
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: image,
        Key: req.file.originalname,
      };
      const response = await s3.upload(params, (err, data) => {
        if (err) {
          console.log('Error occured while trying to upload to S3 bucket', err);
        }
        if (data) {
          fs.unlinkSync(req.file.path); // Empty temp folder
          picture = data.Location;
          console.log(`ok: ${picture}`);
        }
      })
        .promise();
      dish.picture = response.Location;
      await saveDishInUser(req, dish);
    } else {
      await saveDishInUser(req, dish);
    }
    res.json({
      ok: true,
      message: 'Profile updated successfully',
      data: {
        dish,
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

handler.patch(upload.single('dishPicture'), async (req, res) => {
  try {
    if (!req.user) throw new Error('You need to be logged in.');
    let picture;
    const {
      id, title, description, ingredients,
    } = req.body;
    const dish = {
      id,
      title,
      description,
      ingredients,
      picture: req.body.pictureUrl ? req.body.pictureUrl : picture,
    };
    if (req.file) {
      const image = await sharp(req.file.path)
        .resize(450, 300)
        .png({ quality: 80 })
        .toBuffer();
      const params = {
        ACL: 'public-read',
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: image,
        Key: req.file.originalname,
      };
      const response = await s3.upload(params, (err, data) => {
        if (err) {
          console.log('Error occured while trying to upload to S3 bucket', err);
        }
        if (data) {
          fs.unlinkSync(req.file.path); // Empty temp folder
          picture = data.Location;
          console.log(`ok: ${picture}`);
        }
      })
        .promise();
      dish.picture = response.Location;
      await updateDishInUser(req, dish);
    } else {
      await updateDishInUser(req, dish);
    }
    res.json({
      ok: true,
      message: 'Profile updated successfully',
      data: {
        dish,
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
