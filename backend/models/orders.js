'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    static associate(models) {
      Orders.belongsTo(models.Users, {
        foreignKey: 'userId',
        as: 'user'
      });
      Orders.hasMany(models.Order_items, {
        foreignKey: 'orderId',
        as: 'items',
        onDelete: 'CASCADE'
      });
    }
  }

  Orders.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      get() {
        const rawValue = this.getDataValue('totalAmount');
        return rawValue === null ? null : parseFloat(rawValue);
      }
    }
  }, {
    sequelize,
    modelName: 'Orders',
    tableName: 'orders'
  });

  return Orders;
};