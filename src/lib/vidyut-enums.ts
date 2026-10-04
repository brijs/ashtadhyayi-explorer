// Grammatical categories accepted by vidyut-prakriya (enum variant names) with Sanskrit and English labels.
// Dependency-free so build scripts can use them too.

export const LAKARAS = [
	{ id: 'Lat', sa: 'लट्', en: 'present' },
	{ id: 'Lit', sa: 'लिट्', en: 'perfect' },
	{ id: 'Lut', sa: 'लुट्', en: 'periphrastic future' },
	{ id: 'Lrt', sa: 'लृट्', en: 'simple future' },
	{ id: 'Lot', sa: 'लोट्', en: 'imperative' },
	{ id: 'Lan', sa: 'लङ्', en: 'imperfect' },
	{ id: 'VidhiLin', sa: 'विधिलिङ्', en: 'optative' },
	{ id: 'AshirLin', sa: 'आशीर्लिङ्', en: 'benedictive' },
	{ id: 'Lun', sa: 'लुङ्', en: 'aorist' },
	{ id: 'Lrn', sa: 'लृङ्', en: 'conditional' }
] as const;
export const PRAYOGAS = [
	{ id: 'Kartari', sa: 'कर्तरि', en: 'active' },
	{ id: 'Karmani', sa: 'कर्मणि', en: 'passive' },
	{ id: 'Bhave', sa: 'भावे', en: 'impersonal' }
] as const;
export const PURUSHAS = [
	{ id: 'Prathama', sa: 'प्रथम', en: '3rd person' },
	{ id: 'Madhyama', sa: 'मध्यम', en: '2nd person' },
	{ id: 'Uttama', sa: 'उत्तम', en: '1st person' }
] as const;
export const VACANAS = [
	{ id: 'Eka', sa: 'एकवचन', en: 'singular' },
	{ id: 'Dvi', sa: 'द्विवचन', en: 'dual' },
	{ id: 'Bahu', sa: 'बहुवचन', en: 'plural' }
] as const;
export const VIBHAKTIS = [
	{ id: 'Prathama', sa: 'प्रथमा', en: 'nominative' },
	{ id: 'Dvitiya', sa: 'द्वितीया', en: 'accusative' },
	{ id: 'Trtiya', sa: 'तृतीया', en: 'instrumental' },
	{ id: 'Caturthi', sa: 'चतुर्थी', en: 'dative' },
	{ id: 'Panchami', sa: 'पञ्चमी', en: 'ablative' },
	{ id: 'Sasthi', sa: 'षष्ठी', en: 'genitive' },
	{ id: 'Saptami', sa: 'सप्तमी', en: 'locative' },
	{ id: 'Sambodhana', sa: 'सम्बोधन', en: 'vocative' }
] as const;
export const LINGAS = [
	{ id: 'Pum', sa: 'पुंलिङ्ग', en: 'masculine' },
	{ id: 'Stri', sa: 'स्त्रीलिङ्ग', en: 'feminine' },
	{ id: 'Napumsaka', sa: 'नपुंसकलिङ्ग', en: 'neuter' }
] as const;
