import boardComment from "../models/boardComment.js";
import reviewModel from "../models/reviewModel.js";
import userApp from "../models/userApp.js";

const getAllComments = async (req, res) => {
  try {
    const response = await boardComment.find().populate("author");
    response.forEach((item) => {
      item.imgProfile = item.author[0].imgProfile;
      item.username = item.author[0].username;
    });
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json(err);
  }
};

const getReviews = async (req, res) => {
  const response = await reviewModel
    .find({ toUserId: req.body.ownerId })
    .populate("author");
  console.log("",response);
  response.forEach((item) => {

    if (item.author) {
      item.fromImgProfile = item.author[0].imgProfile;
      item.fromUsername = item.author[0].username;
    }
  });
  try {
    /* response.map((review) => {
      let imgProfile = "";
      let username = "";
      users.map((user) => {
        if (review.fromUserId === user.id) {
          imgProfile = user.imgProfile;
          username = user.username;
        }
      });
      review.fromUsername = username;
      return (review.fromImgProfile = imgProfile);
    }); */
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json(err);
  }
};
const addAComment = async (req, res) => {
  const { comment, userId, createdAt, dateNow } = req.body;
  const allComments = await boardComment.find();

  const commentId =
    allComments.reduce((a, b) => {
      return Math.max(a, b.commentId);
    }, 0) + 1;

  const author = await userApp.find({ id: userId });

  try {
    const newBoardComment = await boardComment.create({
      username: author[0].username,
      author: author[0]._id.toString(),
      comment,
      commentId,
      userId,
      createdAt,
      dateNow,
    });
    await userApp.findOneAndUpdate(
      { id: userId },
      {
        $push: { comments: { comment, createdAt, dateNow } },
      }
    );

    res.status(200).json(newBoardComment);
  } catch (err) {
    res.status(400).json({ errorMessage: err.message });
  }
};
const addAReview = async (req, res) => {
  const {
    /*  fromUsername, */
    fromUserId,
    review,
    toUsername,
    toUserId,
    createdAt,
    dateNow,
    /* fromImgProfile, */
  } = req.body;
  const allReviews = await reviewModel.find();
  const reviewIdNew =
    allReviews.reduce((a, b) => {
      return Math.max(a, b.reviewId);
    }, 0) + 1;

  const author = await userApp.find({ id: fromUserId });
  try {
    const newReviewComment = await reviewModel.create({
      reviewId: reviewIdNew,
      fromUsername: author[0].username,
      fromImgProfile: author[0].imgProfile,
      fromUserId,
      review,
      toUsername,
      toUserId,
      createdAt,
      dateNow,
    });

    res.status(200).json(newReviewComment);
  } catch (err) {
    res.status(400).json(err);
  }
};

export { getAllComments, addAComment, addAReview, getReviews };
