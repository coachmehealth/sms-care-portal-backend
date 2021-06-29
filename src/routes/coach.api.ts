import express from 'express';
import { Coach } from '../models/coach.model';
import auth from '../middleware/auth';
import { Patient } from '../models/patient.model';

const router = express.Router();

router.get('/getPatients', auth, (req, res) => {
  return Patient.find().then((patients) => {
    return res.status(200).json(patients);
  });
});

router.get('/search', auth, async (req, res) => {
  const { query } = req.query;
  Coach.aggregate([
    { $project: { name: { $concat: ['$firstName', ' ', '$lastName'] } } },
    {
      $match: {
        name: {
          $regex: query,
          $options: 'i',
        },
      },
    },
  ]).exec((err, result) => {
    return res.status(200).json({
      coaches: result,
    });
  });
});

export default router;
