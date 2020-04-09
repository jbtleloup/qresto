import nextConnect from 'next-connect';
import middleware from '../../middlewares/middleware';

const handler = nextConnect();
handler.use(middleware);

handler.get(async (req, res) => {
  try {
    const dishes = await req.db.collection('users')
      .findOne(
        { _id: req.user._id },
        { projection: { dishes: 1 } },
      );
    console.log(dishes);
    res.json({
      data: dishes,
      ok: true,
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
