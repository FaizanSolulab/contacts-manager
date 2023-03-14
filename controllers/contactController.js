const asyncHandler = require("express-async-handler");
const logger = require("../logger");
const validateTokenHandler = require("../middleware/validateTokenHandler");
const Contact = require("../models/contactModel");
//@desc Get all contacts
//@route GET /api/contacts
//@access private
const getContact = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({user_id : req.user.id}); //it will fetch the contacts associated with that particular user
  res.status(200).json(contacts);
});

//@desc Create new contact
//@route POST /api/contacts
// @access private
const createContact = asyncHandler(async (req, res) => {
    const {name, email, phone} = req.body;
    if(!name || !email || !phone){
      logger.error("All fields are mandatory!");
      res.status(400).send({error:"All fields are mandatory"});
      return;
    }
    const contact = await Contact.create({
        name,
        email,
        phone,
        user_id: req.user.id,
    });

    logger.info(`New contact created with id: $(contact._id)`);
  res.status(201).json(contact);
});

//@desc Get a contact
//@route GET /api/contacts/:id
//@access private
const getContactById = asyncHandler (async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
      logger.error("Contact not found");
      res.status(404).send({error: "Contact not found"});
      return;
    }
  res.json(contact);
});

//@desc Update a contact
//@route PUT /api/contacts/:id
//@access private
const updateContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
      logger.error("Contact not found");
      res.status(404).send({ error: "Contact not found"});
      return;
    }

    //checking if a different user is trying to update a contact of another user
    if(contact.user_id.toString !== req.user.id){
      logger.error("User do not have permission to update the contact of other user");
      res.status(403).send({ error: "User do not have permission to update the contact of other user"});
      return;
    }

    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new : true}
    );
  res.status(200).json(updatedContact);
});

//@desc Delete a contact
//@route DELETE /api/contacts/:id
//@access private
const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        logger.error(`Contact with id $(req.params.id) not found`);
        res.status(404).send({ error: "Contact not found"});
        return;
    }
    // await Contact.findOneAndRemove();
    await Contact.deleteOne({_id: req.params.id});

    logger.info(`Contact with id ${req.params.id} has been deleted`);
    res.status(200).json(contact);
});

module.exports = {
  getContact,
  createContact,
  getContactById,
  updateContact,
  deleteContact,
};
