'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Menu_items extends Model {
    static associate(models) {
      Menu_items.belongsTo(models.Categories, {
        foreignKey: 'categoryId',
        as: 'category'
      });
      Menu_items.hasMany(models.Order_items, {
        foreignKey: 'menuItemId',
        as: 'orderItems',
        onDelete: 'RESTRICT'
      });
    }
  }

  Menu_items.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('price');
        return rawValue === null ? null : parseFloat(rawValue);
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Menu_items',
    tableName: 'menu_items'
  });

  return Menu_items;
};