var express = require('express');
var router = express.Router();

const fileUploader = require('../config/cloudinary.config');

const Restaurant = require('../models/Restaurant.model')

const Review = require('../models/Review.model')

router.get('/view-restaurants', (req, res, next) => {

    Restaurant.find()
    .populate('owner')
    .then((foundRestaurants) => {
        res.json('restaurants/view-restaurants', { foundRestaurants, session: req.session });
    })
    .catch((err) => {
        console.log(err)
    })

});

router.get('/add-restaurant', isLoggedIn, (req, res, next) => {
    res.json('restaurants/add-restaurant', {session: req.session});
  });

router.post('/add-restaurant', isLoggedIn, fileUploader.single('imageUrl'), (req, res, next) => {

    const { name, description } = req.body

    Restaurant.create({
        name,
        description,
        imageUrl: req.file.path,
        owner: req.session.user._id
    })
    .then((createdRestaurant) => {
        console.log(createdRestaurant)
        res.redirect('/restaurants/view-restaurants')
    })
    .catch((err) => {
        console.log(err)
    })

})

router.get('/details/:id', (req, res, next) => {
    
    Restaurant.findById(req.params.id)
    .populate('owner')
    .populate({
        path: "reviews",
        populate: {path: "user"}
    })
    .then((foundRestaurant) => {
        res.json('restaurants/restaurant-details', foundRestaurant)
    })
    .catch((err) => {
        console.log(err)
    })

})

router.get('/edit/:id', isOwner, (req, res, next) => {

    Restaurant.findById(req.params.id)
    .then((foundRestaurant) => {
        res.json('restaurants/edit-restaurant', {foundRestaurant, session: req.session})
    })
    .catch((err) => {
        console.log(err)
    })
})

router.post('/edit/:id', (req, res, next) => {
    const { name, description, imageUrl } = req.body
    Restaurant.findByIdAndUpdate(req.params.id, 
        {
            name, 
            description,
            imageUrl
        },
        {new: true})
    .then((updatedRestaurant) => {
        console.log(updatedRestaurant)
        res.redirect(`/restaurants/details/${req.params.id}`)
    })
    .catch((err) => {
        console.log(err)
    })
}) 

router.get('/delete/:id', isOwner, (req, res, next) => {
    Restaurant.findByIdAndDelete(req.params.id)
    .then((confirmation) => {
        console.log(confirmation)
        res.redirect('/restaurants/view-restaurants')
    })
    .catch((err) => {
        console.log(err)
    })
})


router.post('/add-review/:id', isNotOwner, (req, res, next) => {

    Review.create({
        user: req.session.user._id,
        comment: req.body.comment
    })
    .then((newReview) => {
       return Restaurant.findByIdAndUpdate(req.params.id, 
            {
                $push: {reviews: newReview._id}
            },
            {new: true})
    })
    .then((restaurantWithReview) => {
        console.log(restaurantWithReview)
        res.redirect(`/restaurants/details/${req.params.id}`)
    })
    .catch((err) => {
        console.log(err)
    })
})
  
module.exports = router;