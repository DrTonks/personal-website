# 个人网站说明

> 这是本项目的根 README。其中包含对 SplashCursor 组件新增 props 的用法说明与建议配置。本项目为个人网站，新开发、新发现的好玩的组件可能会在该项目中使用，长期维护域名为[Tonks的个人网站](https://tonks.top)。

## 基于sleepy的电脑状态时间网站

后端部署在阿里云服务器上。一个简单的监控电脑的网站项目，可以集成到监视手机应用状态，只不过苹果手机实现起来比较麻烦。此项目为纯前端项目，感兴趣的可以移步sleepy项目。

## 实验性功能

## 1.SplashCursor (VUEBITS动画库的流体溅射光标) - 新增可配置项

组件文件：`src/SplashCursor/SplashCursor.vue`

新增（向后兼容）props：

- `HUE_MIN`, `HUE_MAX` (number, 0..1, optional)
  - 含义：当同时提供时，splat 颜色的色相（HSV 中的 hue）会在 [HUE_MIN, HUE_MAX] 区间内随机采样。Hue 取值范围为 0..1（0 红，0.33 绿，0.66 蓝）。
  - 推荐：用于限定颜色主题，例如蓝紫区间 0.62..0.78。

- `COLOR_INTENSITY` (number, default 0.15)
  - 含义：HSV->RGB 后的缩放系数，控制溅射的明亮程度。原实现固定为 0.15，现在可调整。
  - 推荐：桌面强机可试 0.18..0.30，移动端可使用较小值如 0.12..0.2。

- `MIN_SPLAT_SPEED` (number, optional)
  - 含义：如果提供，只有当 pointer 的移动速度（归一化坐标差）超过此阈值时，才会触发 splat。用于抑制微小抖动产生的特效。
  - 推荐值：0.005..0.02（视设备和 DPI 调整）。

- `DISABLE_CLICK_SPLAT` (boolean, default false)
  - 含义：当为 true 时，鼠标左键点击将不会产生 click 型的 splat（仍保留拖动/移动触发的 splat 行为，除非同时设置 `MIN_SPLAT_SPEED`）。
  - 向后兼容性：默认 false，老代码不传此 prop 时点击行为不变。
  - 例子：`<SplashCursor :DISABLE_CLICK_SPLAT="true" />` 会禁止点击产生的遮挡动画。

- 向后兼容性：若不传这些 props，组件保持原始行为（完全随机颜色、任何移动都会 splat）。
