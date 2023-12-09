const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findAll({ include: { all: true, nested: true }});

    res.status(200).json(productData);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const singleProductData = await Product.findByPk(req.params.id);

    if (!singleProductData) {
      res.status(404).end();
    } else {
      res.status(200).json(singleProductData);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      category: "Shoes",
      tagIds: [1, 2, 3, 4]
    }
  */
  try {
    const { product_name, price, stock, category, tagIds } = req.body;

    if (!product_name || !price || !stock || !category) {
      res.status(400).send();
      return;
    }

    // Find or create the category
    const [categoryObj] = await Category.findOrCreate({
      where: { category_name: category },
    });

    const productObj = await Product.create({
      product_name,
      price,
      stock,
      category_id: categoryObj.id,
    });

    // if there are product tags, create associations
    if (tagIds && tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => ({
        product_id: productObj.id,
        tag_id,
      }));

      await ProductTag.bulkCreate(productTagIdArr);
    }

    // Fetch the product with associations
    const productWithAssociations = await Product.findByPk(productObj.id, {
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });

    res.status(200).json(productWithAssociations);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// update product data
router.put('/:id', (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
    returning: true,
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {

          const productTagIds = productTags.map(({ tag_id }) => tag_id);

          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);

          // runs both operations
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json(err);
    });
});


router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const singleProductData = await Product.findByPk(req.params.id);

    if (!singleProductData) {
      res.status(404).end();
    } else {
      await ProductTag.destroy({
        where: {
          product_id: req.params.id
        }
      });
      await singleProductData.destroy();
      res.status(200).json(singleProductData);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

module.exports = router;
