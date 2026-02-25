export interface PetName {
  id: string;
  name: string;
  animalType: string;
  origin: string;
  meaning: string;
  attributes: string[];
  popularity: number;
  namedAfter?: string[];
  famousPets?: string[];
  description: string;
  gender: "male" | "female" | "unisex";
}

export const petNames: PetName[] = [
  // Собаки
  { id: "rex", name: "Рекс", animalType: "Собака", origin: "Латинское", meaning: "Король", attributes: ["сильный", "верный", "храбрый"], popularity: 95, famousPets: ["Комиссар Рекс (сериал)"], description: "Классическое имя для сильных и верных собак. От латинского Rex — «король».", gender: "male" },
  { id: "buddy", name: "Бадди", animalType: "Собака", origin: "Английское", meaning: "Друг, приятель", attributes: ["дружелюбный", "весёлый", "верный"], popularity: 92, famousPets: ["Бадди из фильма «Эйр Бад»"], description: "Идеальное имя для друга семьи. Означает «приятель, друг».", gender: "male" },
  { id: "luna_dog", name: "Луна", animalType: "Собака", origin: "Латинское", meaning: "Луна", attributes: ["красивая", "нежная", "загадочная"], popularity: 94, description: "Популярнейшее имя для собак, означающее «луна». Подходит для изящных и загадочных питомцев.", gender: "female" },
  { id: "bella_dog", name: "Белла", animalType: "Собака", origin: "Итальянское", meaning: "Красивая", attributes: ["красивая", "нежная", "добрая"], popularity: 96, famousPets: ["Белла из «Путь домой»"], description: "От итальянского bella — «красивая». Одно из самых популярных имён для собак во всём мире.", gender: "female" },
  { id: "sharik", name: "Шарик", animalType: "Собака", origin: "Русское", meaning: "Круглый, пушистый", attributes: ["весёлый", "дружелюбный", "игривый"], popularity: 80, famousPets: ["Шарик из Простоквашино"], description: "Традиционное русское имя для дворовых собак. Стало культовым благодаря мультфильму «Простоквашино».", gender: "male" },
  { id: "mukhtar", name: "Мухтар", animalType: "Собака", origin: "Арабское", meaning: "Избранный", attributes: ["верный", "умный", "храбрый"], popularity: 75, famousPets: ["Комиссар Мухтар (фильм)"], description: "Популярное имя для служебных собак. От арабского «избранный».", gender: "male" },

  // Кошки
  { id: "murka", name: "Мурка", animalType: "Кошка", origin: "Русское", meaning: "Мурлыкающая", attributes: ["нежная", "ласковая", "домашняя"], popularity: 85, description: "Классическое русское имя для кошки, от звука мурлыканья.", gender: "female" },
  { id: "barsik", name: "Барсик", animalType: "Кошка", origin: "Русское", meaning: "Барс, леопард", attributes: ["игривый", "ловкий", "красивый"], popularity: 88, description: "Одно из самых популярных имён для котов в России. Связано со словом «барс» — леопард.", gender: "male" },
  { id: "simba", name: "Симба", animalType: "Кошка", origin: "Суахили", meaning: "Лев", attributes: ["храбрый", "сильный", "красивый"], popularity: 90, famousPets: ["Симба из «Король Лев»"], description: "На языке суахили означает «лев». Стало мегапопулярным благодаря мультфильму «Король Лев».", gender: "male" },
  { id: "nala", name: "Нала", animalType: "Кошка", origin: "Африканское", meaning: "Подарок, удачливая", attributes: ["красивая", "умная", "ловкая"], popularity: 82, famousPets: ["Нала из «Король Лев»"], description: "Имя спутницы Симбы из «Короля Льва». Означает «подарок» на нескольких африканских языках.", gender: "female" },
  { id: "whiskers", name: "Вискерс", animalType: "Кошка", origin: "Английское", meaning: "Усы", attributes: ["забавный", "игривый", "пушистый"], popularity: 70, description: "Английское слово «усы». Классическое имя для усатого кота.", gender: "male" },

  // Попугаи
  { id: "kesha", name: "Кеша", animalType: "Попугай", origin: "Русское", meaning: "Краткая форма от Иннокентий", attributes: ["весёлый", "болтливый", "умный"], popularity: 95, famousPets: ["Попугай Кеша (мультфильм)"], description: "Культовое имя для попугаев в России благодаря мультфильму «Возвращение блудного попугая».", gender: "male" },
  { id: "polly", name: "Полли", animalType: "Попугай", origin: "Английское", meaning: "Краткая форма от Мэри", attributes: ["болтливая", "весёлая", "яркая"], popularity: 88, description: "Классическое английское имя для попугаев. «Polly wants a cracker» — известная фраза.", gender: "female" },
  { id: "rio", name: "Рио", animalType: "Попугай", origin: "Испанское", meaning: "Река", attributes: ["яркий", "весёлый", "экзотический"], popularity: 78, famousPets: ["Голубчик из мультфильма «Рио»"], description: "Стало популярным благодаря мультфильму «Рио» про голубых ара.", gender: "male" },

  // Змеи
  { id: "naga", name: "Нага", animalType: "Змея", origin: "Санскрит", meaning: "Змей, дракон", attributes: ["загадочный", "мудрый", "сильный"], popularity: 75, description: "В индуизме и буддизме наги — полубожественные змееподобные существа, символ мудрости.", gender: "unisex" },
  { id: "kaa", name: "Каа", animalType: "Змея", origin: "Литературное", meaning: "Персонаж Киплинга", attributes: ["мудрый", "загадочный", "гипнотический"], popularity: 82, famousPets: ["Каа из «Книги джунглей»"], description: "Знаменитый питон из «Книги джунглей» Редьярда Киплинга.", gender: "male" },
  { id: "medusa", name: "Медуза", animalType: "Змея", origin: "Греческое", meaning: "Защитница, повелительница", attributes: ["красивая", "загадочная", "сильная"], popularity: 70, description: "В греческой мифологии — Горгона со змеями вместо волос. Символ мистической силы.", gender: "female" },

  // Тигры
  { id: "sher_khan", name: "Шер-Хан", animalType: "Тигр", origin: "Персидское", meaning: "Тигр-повелитель", attributes: ["сильный", "величественный", "храбрый"], popularity: 88, famousPets: ["Шер-Хан из «Книги джунглей»"], description: "Знаменитый тигр из «Книги джунглей». «Шер» означает «тигр», «Хан» — «повелитель».", gender: "male" },
  { id: "amur", name: "Амур", animalType: "Тигр", origin: "Русское", meaning: "Река Амур", attributes: ["сильный", "величественный", "редкий"], popularity: 72, famousPets: ["Тигр Амур из приморского сафари-парка"], description: "Имя, связанное с амурским тигром — редким подвидом, обитающим на Дальнем Востоке России.", gender: "male" },

  // Хомяки
  { id: "hammy", name: "Хэмми", animalType: "Хомяк", origin: "Английское", meaning: "От слова hamster", attributes: ["забавный", "игривый", "энергичный"], popularity: 75, famousPets: ["Хэмми из мультфильма «Лесная братва»"], description: "Классическое имя для хомяка, произошедшее от английского hamster.", gender: "male" },
  { id: "puhlik", name: "Пухлик", animalType: "Хомяк", origin: "Русское", meaning: "Пухлый, круглый", attributes: ["забавный", "пушистый", "милый"], popularity: 70, description: "Ласковое русское имя для пушистого хомячка.", gender: "male" },

  // Черепахи
  { id: "tortilla", name: "Тортилла", animalType: "Черепаха", origin: "Итальянское", meaning: "Черепаха", attributes: ["мудрая", "спокойная", "терпеливая"], popularity: 80, famousPets: ["Черепаха Тортилла из «Золотой ключик»"], description: "Знаменитая черепаха из сказки «Золотой ключик», подарившая Буратино золотой ключик.", gender: "female" },
  { id: "franklin", name: "Франклин", animalType: "Черепаха", origin: "Английское", meaning: "Свободный землевладелец", attributes: ["спокойный", "мудрый", "дружелюбный"], popularity: 68, famousPets: ["Черепашка Франклин (мультсериал)"], description: "Имя черепашки из популярного канадского мультсериала.", gender: "male" },

  // Кролики
  { id: "krolik_roger", name: "Роджер", animalType: "Кролик", origin: "Германское", meaning: "Славное копьё", attributes: ["весёлый", "энергичный", "забавный"], popularity: 72, famousPets: ["Кролик Роджер (мультфильм)"], description: "Знаменитый кролик из фильма «Кто подставил кролика Роджера».", gender: "male" },
  { id: "usagi", name: "Усаги", animalType: "Кролик", origin: "Японское", meaning: "Кролик", attributes: ["милый", "нежный", "ловкий"], popularity: 65, description: "На японском языке «усаги» означает «кролик». Популярное имя для декоративных кроликов.", gender: "unisex" },

  // Рыбки
  { id: "nemo", name: "Немо", animalType: "Рыбка", origin: "Латинское", meaning: "Никто", attributes: ["яркий", "храбрый", "весёлый"], popularity: 92, famousPets: ["Немо из «В поисках Немо»"], description: "Стало мегапопулярным благодаря мультфильму Pixar «В поисках Немо».", gender: "male" },
  { id: "dory", name: "Дори", animalType: "Рыбка", origin: "Греческое", meaning: "Подарок", attributes: ["весёлая", "забавная", "добрая"], popularity: 85, famousPets: ["Дори из «В поисках Немо» и «В поисках Дори»"], description: "Голубой хирург из мультфильмов Pixar. Забывчивая, но очень добрая рыбка.", gender: "female" },
];

export const animalTypes = ["Собака", "Кошка", "Попугай", "Змея", "Тигр", "Хомяк", "Черепаха", "Кролик", "Рыбка"];
export const petAttributes = [...new Set(petNames.flatMap(n => n.attributes))];
