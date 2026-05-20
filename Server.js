const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS cliente (
            id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            email TEXT UNIQUE,
            telefono TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

app.get('/clientes', (req, res) => {
    db.all("SELECT * FROM cliente", [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});

app.post('/clientes', (req, res) => {

    const { nombre, email, telefono } = req.body;

    const sql = `
        INSERT INTO cliente(nombre,email,telefono)
        VALUES(?,?,?)
    `;

    db.run(sql, [nombre, email, telefono], function(err){

        if(err){

            if(err.message.includes('UNIQUE')){
                return res.status(409).json({
                    error:'Correo ya registrado'
                });
            }

            return res.status(500).json({
                error: err.message
            });
        }

        res.status(201).json({
            id:this.lastID,
            nombre,
            email,
            telefono
        });

    });

});

app.put('/clientes/:id', (req, res) => {

    const { nombre, email, telefono } = req.body;

    db.run(`
        UPDATE cliente
        SET nombre=?, email=?, telefono=?
        WHERE id_cliente=?
    `,
    [nombre, email, telefono, req.params.id],
    function(err){

        if(err){
            return res.status(500).json({
                error: err.message
            });
        }

        if(this.changes === 0){
            return res.status(404).json({
                error:'Cliente no encontrado'
            });
        }

        res.json({
            mensaje:'Cliente actualizado'
        });

    });
});

app.delete('/clientes/:id', (req, res) => {

    db.run(`
        DELETE FROM cliente
        WHERE id_cliente=?
    `,
    [req.params.id],
    function(err){

        if(err){
            return res.status(500).json({
                error: err.message
            });
        }

        if(this.changes === 0){
            return res.status(404).json({
                error:'Cliente no encontrado'
            });
        }

        res.json({
            mensaje:'Cliente eliminado'
        });

    });

});

app.listen(3000, () => {
    console.log('Servidor funcionando en puerto 3000');
});