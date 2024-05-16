var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require("../routes/index");
var usersRouter = require("../routes/users");
var authRouter = require("../routes/auth");
var ownerRouter = require("../routes/owners");
var employeeRouter = require("../routes/employees");
var hairstyleRouter = require("../routes/hairstyles");
var storeRouter = require("../routes/stores");
var commodityRouter = require("../routes/commodities");
var payslipRouter = require("../routes/payslips");
var orderRouter = require("../routes/orders");

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/auth", authRouter);
app.use("/owners", ownerRouter);
app.use("/employees", employeeRouter);
app.use("/hairstyles", hairstyleRouter);
app.use("/stores", storeRouter);
app.use("/commodity", commodityRouter);
app.use("/payslips", payslipRouter);
app.use("/orders", orderRouter);

module.exports = app;
