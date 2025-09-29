# 项目说明

这是本项目的根 README。其中包含对 SplashCursor 组件新增 props 的用法说明与建议配置，方便团队查阅。

## SplashCursor (流体溅射光标) - 新增可配置项
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

### 快速示例（在 `IndexPage.vue` 中）
```vue
<SplashCursor
  :HUE_MIN="0.62"
  :HUE_MAX="0.78"
  :COLOR_INTENSITY="0.22"
  :MIN_SPLAT_SPEED="0.008"
/>
```

### 调试建议
- 在本机和移动设备上分别调试 `MIN_SPLAT_SPEED`，并在高 DPI 屏上适当增大阈值。
- 若希望静态配色（固定颜色或固定调色板），后续可以继续扩展组件以支持 `COLOR_MODE` / `COLOR_PALETTE` 等配置。

如需我把 README 内容放在项目的其他位置或以中文/英文两种语言同步，请告诉我。
