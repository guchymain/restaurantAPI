'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order_items extends Model {
    static associate(models) {
      Order_items.belongsTo(models.Orders, {
        foreignKey: 'orderId',
        as: 'order'
      });
      Order_items.belongsTo(models.Menu_items, {
        foreignKey: 'menuItemId',
        as: 'menuItem'
      });
    }
  }

  Order_items.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    menuItemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('unitPrice');
        return rawValue === null ? null : parseFloat(rawValue);
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('subtotal');
        return rawValue === null ? null : parseFloat(rawValue);
      }
    }
  }, {
    sequelize,
    modelName: 'Order_items',
    tableName: 'order_items'
  });

  return Order_items;
};