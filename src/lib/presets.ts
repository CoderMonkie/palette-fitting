// 原型 index.html 的 PRESETS / ROLES，色值与名称逐字照抄。
export interface Preset {
  name: string
  bg: string
  surface: string
  accent: string
}
export type RoleKey = 'bg' | 'surface' | 'accent'
export interface Role { key: RoleKey; label: string }

export const PRESETS: Preset[] = [
  { name: '宣纸 · 松石', bg: '#F5F1E8', surface: '#FBF8F1', accent: '#2E6E6A' },
  { name: '绢本 · 赭石', bg: '#F3ECDD', surface: '#FAF5EA', accent: '#9C6B3E' },
  { name: '青绿 · 石青', bg: '#EEF1EC', surface: '#F6F8F4', accent: '#2C5F73' },
  { name: '黛蓝 · 远岫', bg: '#EDEEF1', surface: '#F5F6F9', accent: '#2C3C56' },
  { name: '茶褐 · 秋香', bg: '#F1ECE0', surface: '#F8F4EA', accent: '#7A5A2C' },
  { name: '藕荷 · 淡紫', bg: '#F2EEF0', surface: '#F8F5F8', accent: '#8E6090' },
]

export const ROLES: Role[] = [
  { key: 'bg', label: '背景' },
  { key: 'surface', label: '工作面' },
  { key: 'accent', label: '主色' },
]
