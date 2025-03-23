# 阿里云盘同步系统贡献指南

## 概述

感谢您有兴趣为阿里云盘同步系统做出贡献！本文档提供了参与项目开发的详细指南，包括环境设置、代码风格、提交流程和最佳实践。无论您是修复错误、添加新功能，还是改进文档，我们都非常欢迎您的贡献。

## 贡献流程

### 1. 准备工作

1. **Fork 项目仓库**
   - 访问 GitHub 上的项目仓库
   - 点击右上角的 "Fork" 按钮，创建一个属于您的仓库副本

2. **克隆仓库**
   ```bash
   git clone https://github.com/您的用户名/aliyundrive-sync.git
   cd aliyundrive-sync
   ```

3. **配置上游仓库**
   ```bash
   git remote add upstream https://github.com/原始用户名/aliyundrive-sync.git
   ```

### 2. 创建分支

为每个功能或修复创建一个新的分支：

```bash
git checkout -b feature/您的功能名称
# 或
git checkout -b fix/您要修复的问题
```

### 3. 开发环境设置

#### 后端开发环境

```bash
# 创建虚拟环境
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 创建配置文件
cp ../config.ini.template ../config.ini
# 根据需要编辑配置文件

# 初始化数据库
python app/initial_setup.py
```

#### 前端开发环境

```bash
cd frontend
npm install

# 启动开发服务器
npm run dev
```

### 4. 开发和测试

1. **编写代码**
   - 遵循下面提到的代码规范
   - 为新功能添加单元测试

2. **运行测试**
   - 后端测试：`cd backend && pytest`
   - 前端测试：`cd frontend && npm test`

3. **本地验证**
   - 确保代码在本地环境中正常运行
   - 验证新功能或修复是否达到预期目的

### 5. 提交代码

1. **提交更改**
   ```bash
   git add .
   git commit -m "描述性的提交消息"
   ```

2. **保持分支最新**
   ```bash
   git checkout main
   git pull upstream main
   git checkout 您的分支名
   git rebase main
   ```

3. **解决可能的冲突**
   - 如果在rebase过程中出现冲突，请解决它们
   - 冲突解决后：`git rebase --continue`

4. **推送到您的fork**
   ```bash
   git push origin 您的分支名
   ```

### 6. 创建Pull Request

1. 访问您的GitHub仓库副本
2. 点击 "New pull request" 按钮
3. 选择您的分支和目标分支（通常是main）
4. 填写PR模板中的信息，详细描述您的更改
5. 提交PR并等待审核

## 代码规范

### Python代码规范

1. **PEP 8**
   - 遵循[PEP 8](https://www.python.org/dev/peps/pep-0008/)风格指南
   - 使用4个空格缩进，不使用制表符
   - 行长度限制在100个字符以内

2. **Docstrings**
   - 为所有函数、类和模块编写文档字符串
   - 使用Google风格的文档字符串格式

3. **导入顺序**
   - 标准库导入
   - 相关第三方导入
   - 本地应用/库特定导入
   - 各组之间空一行

4. **命名约定**
   - 类名：`CamelCase`
   - 函数和变量：`snake_case`
   - 常量：`ALL_CAPS`
   - 模块级私有函数/变量：`_prefixed`

### TypeScript/JavaScript代码规范

1. **基本规范**
   - 使用2个空格缩进
   - 使用分号结束语句
   - 行长度限制在100个字符以内

2. **命名约定**
   - 组件名：`PascalCase`
   - 函数和变量：`camelCase`
   - 常量：`UPPER_CASE`
   - 接口名：`IPrefixed`
   - 类型名：`TPrefixed`

3. **TypeScript特有规范**
   - 尽可能使用类型注解，减少`any`的使用
   - 接口优于类型别名
   - 为函数参数和返回值添加类型

4. **React组件**
   - 使用函数组件和Hooks
   - 每个文件只包含一个组件
   - 组件文件名与组件名相同

### CSS/SCSS规范

1. **命名约定**
   - 使用kebab-case（短横线命名法）
   - 使用BEM命名方法论
   - 避免过深的选择器嵌套

2. **结构**
   - 将全局样式与组件样式分离
   - 使用变量管理颜色、字体等

## 提交规范

1. **提交消息格式**
   ```
   <类型>(<作用域>): <主题>

   <内容>

   <页脚>
   ```

2. **类型**
   - `feat`：新功能
   - `fix`：修复bug
   - `docs`：文档更改
   - `style`：代码格式变化，不影响代码运行
   - `refactor`：重构代码
   - `perf`：性能优化
   - `test`：添加或修改测试
   - `chore`：构建过程或辅助工具的变动

3. **作用域**（可选）
   - `backend`、`frontend`、`api`、`db`、`ui`等

4. **主题**
   - 简短描述，不超过50个字符
   - 使用祈使句（"Fix" 而不是 "Fixed"）
   - 首字母不要大写
   - 结尾不加句号

5. **内容**（可选）
   - 详细描述更改的原因和方式
   - 可以使用多行

6. **页脚**（可选）
   - 引用相关的issue或PR
   - 例如："Closes #123"、"Related to #456"

## 测试指南

### 后端测试

1. **单元测试**
   - 使用pytest编写测试
   - 测试文件放在`backend/tests`目录
   - 文件名格式：`test_*.py`

2. **测试覆盖率**
   - 运行测试覆盖率：`pytest --cov=app`
   - 尽量保持高覆盖率

3. **测试数据库**
   - 使用SQLite内存数据库进行测试
   - 每个测试后清理数据库状态

### 前端测试

1. **单元测试**
   - 使用Jest和React Testing Library
   - 测试文件放在与组件相同的目录，命名为`*.test.tsx`

2. **组件测试**
   - 测试组件渲染和交互
   - 模拟API调用和Redux状态

3. **端到端测试**（重要功能）
   - 使用Cypress进行关键流程测试
   - 测试文件放在`frontend/cypress/integration`

## 文档贡献

1. **代码文档**
   - 为复杂的函数和类编写详细的文档字符串
   - 为复杂的逻辑添加行内注释

2. **用户文档**
   - 更新`docs`目录下的相关文档
   - 确保文档与当前功能一致

3. **示例和教程**
   - 提供实际使用场景的示例
   - 为新功能编写简明的教程

## 问题报告

如果您发现bug或有功能请求，请按以下步骤提交issue：

1. 检查现有issue，避免重复
2. 使用提供的issue模板
3. 提供详细的重现步骤和环境信息
4. 如可能，附上截图或视频

## 审核流程

1. **代码审核标准**
   - 代码质量和风格
   - 测试覆盖率
   - 文档完整性
   - 性能影响
   - 安全考虑

2. **审核时间**
   - 维护者通常会在3个工作日内回复PR
   - 大型变更可能需要更长时间审核

3. **审核结果**
   - 批准：可以合并
   - 要求更改：需进行指定修改
   - 评论：提供反馈但不阻止合并

## 开发最佳实践

1. **保持简单**
   - 小而频繁的提交
   - 功能聚焦的PR
   - 简洁清晰的代码

2. **安全考虑**
   - 不要暴露敏感信息
   - 对用户输入进行验证和清洁
   - 使用参数化查询防止SQL注入

3. **性能考虑**
   - 避免N+1查询问题
   - 减少不必要的API请求
   - 使用缓存优化频繁访问的数据

4. **可维护性**
   - 编写测试
   - 代码注释
   - 遵循SOLID原则
   - 重用现有代码而非重新发明轮子

## 获取帮助

如果您在贡献过程中需要帮助，可以：

1. 查阅项目文档
2. 在issue中提问
3. 联系项目维护者

## 行为准则

我们希望所有贡献者遵循以下原则：

1. 相互尊重
2. 建设性的反馈
3. 专注于项目和技术，而非个人

## 致谢

再次感谢您对阿里云盘同步系统的贡献！您的付出将帮助这个项目变得更好。

---

最后更新：2023年10月1日 