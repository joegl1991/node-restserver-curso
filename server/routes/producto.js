const express = require('express');
const Producto = require('../models/producto');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

// ===================
// Get Productos
// ===================
app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .sort('nombre')
        .exec((err, productosDB) => {

            if (err) {
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }

            Producto.countDocuments((err, conteo) => {

                res.json({
                    ok: true,
                    productos: productosDB,
                    total: conteo
                });

            });


        });

});

// ===================
// Get Producto por ID
// ===================
app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {

            if (err) {
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }

            if (!productoDB) {
                return res.status(400)
                    .json({
                        ok: false,
                        err
                    });
            }

            res.json({
                ok: true,
                producto: productoDB
            });


        })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email');

});

// ===================
// Buscar Productos
// ===================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regExp = new RegExp(termino, 'i');

    Producto.find({ nombre: regExp })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productosDB) => {

            if (err) {
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }

            res.json({
                ok: true,
                productos: productosDB
            });

        });

});

// ===================
// Crear Producto
// ===================
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: Number(body.precioUni),
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        if (!productoDB) {
            return res.status(400)
                .json({
                    ok: false,
                    err
                });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });

});

// ===================
// Actualizar Producto
// ===================
app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        if (!productoDB) {
            return res.status(400)
                .json({
                    ok: false,
                    err: {
                        message: 'El ID no existe'
                    }
                });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = Number(body.precioUni);
        productoDB.descripcion = body.descripcion;
        productoDB.categoria = body.categoria;

        productoDB.save((err, productoActualizado) => {

            if (err) {
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }

            if (!productoActualizado) {
                return res.status(400)
                    .json({
                        ok: false,
                        err
                    });
            }

            res.status(201).json({
                ok: true,
                producto: productoActualizado
            });

        });

    });

});

// ===================
// Eliminar Producto
// ===================
app.delete('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let disponible = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, disponible, (err, productoDB) => {

        if (err) {
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        if (!productoDB) {
            return res.status(400)
                .json({
                    ok: false,
                    err
                });
        }

        res.json({
            ok: false,
            productoEliminado: productoDB
        });

    });

});

module.exports = app;