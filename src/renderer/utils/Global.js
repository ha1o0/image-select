var projectPath = ""
var configMap = new Map([["problemType", "问题类型"], ["geometricModel", "几何模型"], ["materialProperty", "材料属性"], ["gridDivision", "网格划分"], ["excitationPara", "激励参数"], ["iterativePara", "迭代参数"], ["postProcessing", "后处理"]])
var configFolderNames = ["problemType", "geometricModel", "materialProperty", "gridDivision", "excitationPara", "iterativePara", "postProcessing"]
var conditionNames = ["问题类型", "几何模型", "材料属性", "网格划分", "激励参数", "迭代参数", "后处理"]
const parameterFilePath = "c:/ProgramData/XJTUNDT"
const parameterFileName = "parameter.dat"
export default {
  projectPath,
  configFolderNames,
  conditionNames,
  configMap,
  parameterFilePath,
  parameterFileName
}