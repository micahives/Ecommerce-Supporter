const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  // "{ include: { all: true }}" to include all associated models
  try {
    const tagData = await Tag.findAll({ include: { all: true }});

    res.status(200).json(tagData);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const singleTagData = await Tag.findByPk(req.params.id);

    if (!singleTagData) {
      res.status(404).end();
    } else {
      res.status(200).json(singleTagData);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const { name } = req.body;
    const tagObj = await Tag.create({
      name,
    });

    res.status(200).json(tagObj);

  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const singleTagData = await Tag.findByPk(req.params.id);

    if (!singleTagData) {
      res.status(404).end();
    } else {
      const { name } = req.body;
      await singleTagData.update({ name });
      res.status(200).json(singleTagData);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const singleTagData = await Tag.findByPk(req.params.id);

    if (!singleTagData) {
      res.status(404).end();
    } else {
      await singleTagData.destroy();
      res.status(200).json(singleTagData);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

module.exports = router;
