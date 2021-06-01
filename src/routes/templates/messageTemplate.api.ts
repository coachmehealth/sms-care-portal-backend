import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import path from 'path';
import fs from 'fs-extra';
import auth from '../../middleware/auth';
import { MessageTemplate } from '../../models/messageTemplate.model';
import multer from '../../utils/multer';

const router = express.Router();

router.post(
  '/newTemplate',
  auth,
  multer.single('media'),
  async (req: Request, res: Response) => {
    if (!req.body.messageTxt || req.body.messageTxt === '') {
      return res.status(400).send('Please Enter Message Text!');
    }
    const newMessageTemplate = new MessageTemplate({
      language: req.body.language,
      text: req.body.messageTxt,
      type: req.body.type,
      creator: req.body.creator,
      media: req?.file?.path,
    });
    return newMessageTemplate
      .save()
      .then(() => {
        res.status(200).json({
          success: true,
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
  },
);

router.post('/deleteTemplate', async (req: Request, res: Response) => {
  const { id } = req.body;
  const template = await MessageTemplate.findByIdAndDelete(new ObjectId(id));
  try {
    if (template?.media) {
      await fs.unlink(path.resolve(template?.media));
      res.status(200);
    }
  } catch {
    res.json({
      message: 'template image not found.',
    });
  }
});

router.get('/templates', auth, async (req: Request, res: Response) => {
  return MessageTemplate.find()
    .then((messageTemplates) => {
      res.status(200).json(messageTemplates);
    })
    .catch((err) => {
      console.log(err.message);
    });
});

router.get('/templates/:creator', auth, async (req: Request, res: Response) => {
  return MessageTemplate.find({
    creator: req.params.creator
  })
    .then((messageTemplates) => {
      res.status(200).json(messageTemplates);
    })
    .catch((err) => {
      console.log(err.message);
    });
});

export default router;
