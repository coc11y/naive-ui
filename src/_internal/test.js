const path = require('node:path')
const fs = require('fs-extra')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const generate = require('@babel/generator').default

// 指定文件夹路径
const folderPath = './icons'

// 获取文件夹中的所有文件
const files = fs.readdirSync(folderPath)
// 遍历所有文件
files.forEach((file) => {
  if (file !== 'index.ts') {
    const filePath = path.join(folderPath, file)

    const code = fs.readFileSync(filePath, 'utf8')
    if (!code.includes('replaceable'))
      return

    // 解析代码为 AST
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    })

    // 遍历 AST 并修改
    traverse(ast, {
      CallExpression(path) {
        if (
          t.isIdentifier(path.node.callee, { name: 'replaceable' })
          && path.node.arguments.length >= 2
        ) {
          // 替换第二个参数

          path.node.arguments[1] = t.arrowFunctionExpression(
            [],
            t.parenthesizedExpression(path.node.arguments[1])
          )
        }
      }
    })

    const generatedCode = generate(ast).code
    // 生成新的代码

    // 写入新的代码到文件
    fs.writeFileSync(filePath, generatedCode, 'utf8')
  }
})
