const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const logger = require('../logger');

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
    const {username, email, password} = req.body;
    if(!username || !email || !password){
      logger.error("All fields are mandatory");
      res.status(400).send({error: "All fields are mandatory"});
      return;
    }

    const userAvailable = await User.findOne({email});
    if(userAvailable){
      logger.error(`User with ${email} already registered`);
        res.status(400).send({ error: "User already registered"});
        return;
    }

    const hashedPassword = await bcrypt.hash(password,10);
    // console.log("hashed password ", hashedPassword);
    logger.info(`Password hashed successfully for user with email ${email}`);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    // console.log(`User created ${user}`);
    if(user){
      logger.info(`User created successfully: ${user}`);
        return res.status(201).json({_id: user.id, email: user.email});
    } else{
      logger.error("User data is not valid");
        return res.status(400).send({error: "User data is not valid"});
    }
});

//@desc Login user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const {email, password} = req.body;
  if(!email || !password) {
    logger.error("All fields are mandatory");
    res.status(400).send({error: "All fields are mandatory"});
    return;
  }
  const user = await User.findOne({ email });
  //compare password with hashedpassword
  //user.password is the hashedpassword from db
  if(user && (await bcrypt.compare(password, user.password))){
    const accessToken = jwt.sign({
      user:{
        username: user.username,
        email: user.email,
        id: user.id
      },
    },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m"}
      );
      logger.info("ACCESS TOKEN successfully generated")
    res.status(200).json({ accessToken });
    return;
  }
  else{
    logger.error("Email or Password is not valid")
    res.status(401).send({error: "Email or Password is not valid"})
  }
});

//@desc Current user
//@route POST /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, currentUser };
