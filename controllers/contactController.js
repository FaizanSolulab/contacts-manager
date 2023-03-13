const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel");
//@desc Get all contacts
//@route GET /api/contacts
const getContact = asyncHandler(async (req, res) => {
    const contacts = await Contact.find();
  res.status(200).json(contacts);
});

//@desc Create new contact
//@route POST /api/contacts
const createContact = asyncHandler(async (req, res) => {
    const {name, email, phone} = req.body;
    if(!name || !email || !phone){
        res.status(400);
        throw new Error("All fields are mandatory!");
    }
    const contact = await Contact.create({
        name,
        email,
        phone,
    });

  res.status(201).json(contact);
});

//@desc Get a contact
//@route GET /api/contacts/:id
const getContactById = asyncHandler (async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found");
    }
  res.json(contact);
});

//@desc Update a contact
//@route PUT /api/contacts/:id
const updateContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found");
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
const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found");
    }
    await Contact.findOneAndRemove();
    res.status(200).json(contact);
});

module.exports = {
  getContact,
  createContact,
  getContactById,
  updateContact,
  deleteContact,
};
