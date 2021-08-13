import fs from 'fs'

export default class TxtUtil {

  static getRules = () => {
    return {
      f: [{
        validator: TxtUtil.floatRule,
        trigger: "change"
      }],
      pf: [{
        validator: TxtUtil.pFloatRule,
        trigger: "change"
      }],
      nf: [{
        validator: TxtUtil.nFloatRule,
        trigger: "change"
      }],
      ni: [{
        validator: TxtUtil.nIntRule,
        trigger: "change"
      }],
      i: [{
        validator: TxtUtil.intRule,
        trigger: "change"
      }]
    }
  }

  static nIntRule = (rule, value, callback) => {
    let ruleObj = new RegExp(TxtUtil.regValidate("non-negative-int"));
    if (!ruleObj.test(value)) {
      callback(new Error("非负整数"));
    } else {
      callback();
    }
  }

  static intRule = (rule, value, callback) => {
    let ruleObj = new RegExp(TxtUtil.regValidate("positive-int"));
    if (!ruleObj.test(value)) {
      callback(new Error("正整数"));
    } else {
      callback();
    }
  }

  static floatRule = (rule, value, callback) => {
    let ruleObj = new RegExp(TxtUtil.regValidate("float"));
    if (!ruleObj.test(value)) {
      callback(new Error("浮点数"));
    } else {
      callback();
    }
  }

  static pFloatRule = (rule, value, callback) => {
    let ruleObj = new RegExp(TxtUtil.regValidate("positive-float"));
    if (!ruleObj.test(value)) {
      callback(new Error("正浮点数"));
    } else {
      callback();
    }
  }

  static nFloatRule = (rule, value, callback) => {
    let ruleObj = new RegExp(TxtUtil.regValidate("non-negative-float"));
    if (!ruleObj.test(value)) {
      callback(new Error("非负浮点数"));
    } else {
      callback();
    }
  }

  //正则验证表达式
  static regValidate = (type) => {
    switch (type) {
      case "float": //浮点数
        return /(^-?.(\d+)$)|(^-?\d+(\.\d+)?$)|(^-?0(\.\d+)[eE]{1}[-+](\d)+$)/
      case "non-negative-int": //非负整数
        return /^\d+$/
      case "non-negative-float": //非负浮点数
        return /(^.(\d+)$)|(^\d+(\.\d+)?$)|(^0(\.\d+)[eE][-+](\d)+$)/
      case "positive-int": //正整数
        return /^[1-9]\d*$/
      case "positive-float": //正浮点数
        return /(^.(\d+)$)|(^[0](\.\d+)$)|(^[1-9]+(\.\d+)?$)|(^0(\.\d+)[eE][-+](\d)+$)/
      default: //非负整数
        return /^\d+$/
    }
  }

  static transformNumber = (number) => {
    let mystr = number.split(",", 2)
    let outppt = mystr[0]
    return outppt
    // return number.toFixed(2)
  }

  //检测输入数据是否是一个有效的float型数据，并且整理成规范的格式
  //返回值有两个，第一个是科学计数法形式的数据，第二个是“Y/N”，分别对应数据是“有效/无效”的
  static checkDataType_Float = (dataInput) => {
    let preStr_1 = dataInput.toLowerCase()
    let preStr_2 = preStr_1.trim()
    let targetStr = preStr_2.replace(/\s*/g, "")
    let exponStr = ""
    let standardStr = ""
    let checkFlag = "Y"
    let valueStr = 0.0
    let minusFlag = 1.0

    if (targetStr.indexOf('e') > -1 || targetStr.indexOf('E') > -1) {
      return [`    ${targetStr}`, checkFlag]
    }
    for (let i = 0; i < targetStr.length; i++) {
      if (targetStr.charCodeAt(i) >= 48 && targetStr.charCodeAt(i) <= 57) {

      } else if (targetStr.charCodeAt(i) >= 45 && targetStr.charCodeAt(i) <= 46) {

      } else {
        checkFlag = "N"
      }
    }

    if (checkFlag == "Y") {
      if (targetStr.indexOf(".") != targetStr.lastIndexOf(".")) {
        checkFlag = "N"
        return [standardStr, checkFlag]
      }
      let decimalFlag = targetStr.indexOf(".")
      // console.log("Start of the test")
      // console.log(decimalFlag)
      if (decimalFlag != -1) {
        //存在小数点的情况,即输入的是一个float型数，分离出整数（Int）和小数（Dec）部分，加权计算实际数值
        let splitValue = targetStr.split(".")
        let partInt = splitValue[0]
        let partDec = splitValue[1]
        //加权计算整数部分的值
        for (let i = 0; i < partInt.length; i++) {
          if (partInt.substring(i, i + 1) == "-") {
            minusFlag = -1.0 * minusFlag
          } else {
            valueStr = valueStr + partInt.substring(i, i + 1) * Math.pow(10, partInt.length - 1 - i)
          }
        }
        //加权计算小数部分的值
        for (let i = 0; i < partDec.length; i++) {
          valueStr = valueStr + partDec.substring(i, i + 1) * Math.pow(10, -(i + 1))
        }
      } else {
        //不存在小数点的情况，即输入的是一个int型数，则直接加权计算具体数值
        for (let i = 0; i < targetStr.length; i++) {
          if (targetStr.substring(i, i + 1) == "-") {
            minusFlag = -1.0 * minusFlag
          } else {
            valueStr = valueStr + targetStr.substring(i, i + 1) * Math.pow(10, targetStr.length - 1 - i)
          }
        }
      }
      valueStr = valueStr * minusFlag
    }
    //利用JS自带函数直接转化为科学计数法
    exponStr = valueStr.toExponential(10)
    standardStr = "    " + exponStr
    //补足单个数据占20位的规则，使所有数据形式上保持一致
    let lenIdx = standardStr.length
    for (let i = 0; i < 20 - lenIdx; i++) {
      standardStr = standardStr + " "
    }
    return [standardStr, checkFlag]
  }

  //检测输入数据是否是一个有效的int型数据，并且整理成规范的格式
  //返回值有两个，第一个是处理后的整数，第二个是“Y/N”，分别对应数据是“有效/无效”的
  static checkDataType_Int = (dataInput, len) => {
    let preStr_1 = dataInput.toLowerCase()
    let preStr_2 = preStr_1.trim()
    let targetStr = preStr_2.replace(/\s*/g, "")
    let checkFlag = "Y"
    for (let i = 0; i < targetStr.length; i++) {
      if (targetStr.charCodeAt(i) >= 48 && targetStr.charCodeAt(i) <= 57) {} else {
        checkFlag = "N"
      }
    }
    let lenIdx = targetStr.length
    for (let i = 0; i < len - lenIdx; i++) {
      targetStr = targetStr + " "
    }
    return [targetStr, checkFlag]
  }


  static readTxt = () => {

  }
  static generateTxt = (data, path) => {
    fs.writeFile('./message.txt', '这是第一行', function (err) {
      if (err) console.log('写文件操作失败');
      else console.log('写文件操作成功');
    });
  }
}