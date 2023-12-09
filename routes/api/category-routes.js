const router = require('express').Router();
const { Category, Product, ProductTag } = require('../../models');
const { Op } = require('sequelize');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({ include: { all: true }});

    res.status(200).json(categoryData);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const singleCategoryData = await Category.findByPk(req.params.id);

    if (!singleCategoryData) {
      res.status(404).end();
    } else {
      res.status(200).json(singleCategoryData);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.post('/', async (req, res) => {
  // create a new category
  console.log(req.body);
  try {
    const { category_name } = req.body;
    console.log(category_name);
    if (!category_name) {
      res.status(404).end();
    }
    const categoryObj = await Category.create({ category_name });

    res.status(200).json(categoryObj);

  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    const singleCategoryData = await Category.findByPk(req.params.id);

    if (!singleCategoryData) {
      res.status(404).end();
    } else {
      const { category_name } = req.body;
      await singleCategoryData.update({ category_name });
      res.status(200).json(singleCategoryData);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const singleCategoryData = await Category.findByPk(req.params.id);

    if (!singleCategoryData) {
      res.status(404).end();
    } else {
      const productsToDelete = await Product.findAll({
        where: { category_id: req.params.id },
      });

      const productIdsToDelete = productsToDelete.map(product => product.id);

      await ProductTag.destroy({
        where: {
          product_id: {
            [Op.in]: productsToDelete.map(product => product.id.toString()),
          },
        },
      });

      for (const product of productsToDelete) {
        await product.destroy();
      }

      await singleCategoryData.destroy();
      res.status(200).json(singleCategoryData);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

module.exports = router;
