import crypto from 'crypto';
// import sgMail from '@sendgrid/mail';
import Mailgun from 'mailgun-js';
import nextConnect from 'next-connect';
import { error } from 'next/dist/build/output/log';
import middleware from '../../../../../middlewares/middleware';

// console.log(process.env.SENDGRID_API_KEY);
// sgMail.setApiKey('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');

const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.DOMAIN;
const fromWho = process.env.EMAIL_FROM;

const handler = nextConnect();

handler.use(middleware);

handler.post(async (req, res) => {
  try {
    if (!req.user) throw new Error('You need to be logged in.');
    const token = crypto.randomBytes(32)
      .toString('hex');
    await req.db.collection('tokens')
      .insertOne({
        token,
        userId: req.user._id,
        type: 'emailVerify',
        expireAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
    const mailgun = new Mailgun({
      apiKey,
      domain,
    });
    const data = {
      from: fromWho,
      to: req.user.email,
      subject: 'Verification email',
      html: `
      <div>
        <p>Hello, ${req.user.name}</p>
        <p>Please follow <a href="${process.env.WEB_URI}/api/user/email/verify/${token}">this link</a> to confirm your email.</p>
      </div>
      `,
    };
    // Invokes the method to send emails given the above data with the helper library
    mailgun.messages()
      .send(data, (err, body) => {
        // If there is an error, render the error page
        if (err) {
          console.log('got an error: ', err);
          throw new Error(err);
        } else {
          console.log(body);
          res.json({ message: 'An email has been sent to your inbox.' });
        }
      });


    // const msg = {
    //   to: req.user.email,
    //   from: process.env.EMAIL_FROM,
    //   subject: 'Verification email',
    //   text: 'test',
    //   html: `
    //   <div>
    //     <p>Hello, ${req.user.name}</p>
    // eslint-disable-next-line max-len
    //     <p>Please follow <a href="${process.env.WEB_URI}/api/user/email/verify/${token}">this link</a> to confirm your email.</p>
    //   </div>
    //   `,
    // };
    // await sgMail.send(msg);
    // res.json({ message: 'An email has been sent to your inbox.' });
  } catch (error) {
    res.json({
      ok: false,
      message: error.toString(),
    });
  }
});

export default handler;
