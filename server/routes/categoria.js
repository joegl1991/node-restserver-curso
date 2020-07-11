const express = require('express');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const app = express();
const Categoria = require('../models/categoria');

// ===========================
// Mostra todas las categorias
// ===========================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find()
        .populate('usuario', 'nombre email')
        .sort('descripcion')
        .exec((err, categorias) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments((err, conteo) => {
                res.json({
                    ok: true,
                    total: conteo,
                    categorias
                });
            });

        });

});

// ===========================
// Mostra una categoria por ID
// ===========================
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    }).populate('usuario', 'nombre email');

});

// ===========================
// Crear nueva categoria
// ===========================
app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;
    let usuarioId = req.usuario._id;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: usuarioId
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

// ===========================
// Actualizar categoria
// ===========================
app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

// ===========================
// Eliminar categoria - Solo Administrador
// ===========================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndDelete(id, (err, categoriaBorrada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada
        });

    });

});


module.exports = app;