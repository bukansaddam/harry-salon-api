var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");

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
var serviceRouter = require("../routes/services");
var reviewRouter = require("../routes/reviews");
var favoriteRouter = require("../routes/favorites");
var orderHistoryRouter = require("../routes/orderHistories");
var presenceRouter = require("../routes/presence");

var app = express();

app.use(cors());
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
app.use("/services", serviceRouter);
app.use("/reviews", reviewRouter);
app.use("/favorites", favoriteRouter);
app.use("/histories/orders", orderHistoryRouter);
app.use("/presence", presenceRouter);

module.exports = app;
