// Category colours derived from the four brand colours (fills) and darker inks (text).
export const CATEGORY_COLORS = {
  'emotional-experiences': '#4FA8A0',
  'emotional-exhaustion': '#7DBDB6',
  'stress-and-anxiety': '#8EC5E8',
  'motivation-and-engagement': '#B5D6EE',
  'self-perception': '#A9C8A5',
  'interpersonal-experiences': '#C7DCC4',
  'mental-health-concepts': '#5F8E9E',
  'coping-and-regulation': '#8DB78A',
  'help-seeking': '#2B6F69',
}
export const colorFor = (cat) => CATEGORY_COLORS[cat] || '#4FA8A0'
