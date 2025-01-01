import {MATCHING_PROBLEM_TYPES} from './matching_types';
import {ALGORITHMS} from './algorithm_const';

export const DEFAULT_ALGORITHM = 'NSGAII';
export const DEFAULT_PROBLEM_TYPE = MATCHING_PROBLEM_TYPES.OTO;
export const DEFAULT_POPULATION_SIZE = 1000;
export const DEFAULT_GENERATION_NUM = 100;
export const DEFAULT_MAXTIME = 5000;
export const DEFAULT_SAMPLE_DISPLAY_NUM = 10;
export const DEFAULT_CORE_NUM = 'all';
export const SMT_ALGORITHMS = Object.freeze(
    [
    ALGORITHMS.NSGA2,
    ALGORITHMS.NSGA3,
    ALGORITHMS.eMOEA,
    ALGORITHMS.PESA2,
    ALGORITHMS.VEGA,
    ALGORITHMS.PAES,
    ALGORITHMS.MOEAD,
    ALGORITHMS.IBEA,
    // PSO algorithms for SMT currently unavailable
    // ALGORITHMS.OMOPSO,
    // ALGORITHMS.SMPSO,
    ]
);
export const INVALID_MATH_SYMBOLS = [
  'π',
  '∞',
  'Σ',
  '√',
  '∛',
  '∜',
  '∫',
  '∬',
  '∭',
  '∮',
  '∯',
  '∰',
  '∱',
  '∲',
  '∳',
  '∀',
  '∁',
  '∂',
  '∃',
  '∄',
  '∅',
  '∆',
  '∇',
  '∈',
  '∉',
  '∊',
  '∋',
  '∌',
  '∍',
  '∎',
  '∏',
  '∐',
  '∑',
  '−',
  '∓',
  '∔',
  '∕',
  '∖',
  '∗',
  '∘',
  '∙',
  '∝',
  '∟',
  '∠',
  '∡',
  '∢',
  '∣',
  '∤',
  '∥',
  '∦',
  '∧',
  '∨',
  '∩',
  '∪',
  '∴',
  '∵',
  '∶',
  '∷',
  '∸',
  '∹',
  '∺',
  '∻',
  '∼',
  '∽',
  '∾',
  '∿',
  '≀',
  '≁',
  '≂',
  '≃',
  '≄',
  '≅',
  '≆',
  '≇',
  '≈',
  '≉',
  '≊',
  '≋',
  '≌',
  '≍',
  '≎',
  '≏',
  '≐',
  '≑',
  '≒',
  '≓',
  '≔',
  '≕',
  '≖',
  '≗',
  '≘',
  '≙',
  '≚',
  '≛',
  '≜',
  '≝',
  '≞',
  '≟',
  '≠',
  '≡',
  '≢',
  '≣',
  '≤',
  '≥',
  '≦',
  '≧',
  '≨',
  '≩',
  '≪',
  '≫',
  '≬',
  '≭',
  '≮',
  '≯',
  '≰',
  '≱',
  '≲',
  '≳',
  '≴',
  '≵',
  '≶',
  '≷',
  '≸',
  '≹',
  '≺',
  '≻',
  '≼',
  '≽',
  '≾',
  '≿',
  '⊀',
  '⊁',
  '⊂',
  '⊃',
  '⊄',
  '⊅',
  '⊆',
  '⊇',
  '⊈',
  '⊉',
  '⊊',
  '⊋',
  '⊌',
  '⊍',
  '⊎',
  '⊏',
  '⊐',
  '⊑',
  '⊒',
  '⊓',
  '⊔',
  '⊕',
  '⊖',
  '⊗',
  '⊘',
  '⊙',
  '⊚',
  '⊛',
  '⊜',
  '⊝',
  '⊞',
  '⊟',
  '⊠',
  '⊡',
  '⊢',
  '⊣',
  '⊤',
  '⊥',
  '⊦',
  '⊧',
  '⊨',
  '⊩',
  '⊪',
  '⊫',
  '⊬',
  '⊭',
  '⊮',
  '⊯',
  '⊰',
  '⊱',
  '⊲',
  '⊳',
  '⊴',
  '⊵',
  '⊶',
  '⊷',
  '⊸',
  '⊹',
  '⊺',
  '⊻',
  '⊼',
  '⊽',
  '⊾',
  '⊿',
  '⋀',
  '⋁',
  '⋂',
  '⋃',
  '⋄',
  '⋅',
  '⋆',
  '⋇',
  '⋈',
  '⋉',
  '⋊',
  '⋋',
  '⋌',
  '⋍',
  '⋎',
  '⋏',
  '⋐',
  '⋑',
  '⋒',
  '⋓',
  '⋔',
  '⋕',
  '⋖',
  '⋗',
  '⋘',
  '⋙',
  '⋚',
  '⋛',
  '⋜',
  '⋝',
  '⋞',
  '⋟',
  '⋠',
  '⋡',
  '⋢',
  '⋣',
  '⋤',
  '⋥',
  '⋦',
  '⋧',
  '⋨',
  '⋩',
  '⋪',
  '⋫',
  '⋬',
  '⋭',
  '⋮',
  '⋯',
  '⋰',
  '⋱',
  '⁺',
  '⁻',
  '⁼',
  '⁽',
  '⁾',
  'ⁿ',
  '₊',
  '₋',
  '₌',
  '₍',
  '₎',
  '✖',
  '﹢',
  '﹣',
  '＋',
  '－',
  '／',
  '＝',
  '÷',
  '±',
  '×',
  '²',
  '³'];



