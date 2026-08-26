#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Парсер официального реестра национальных таджикских имён:
«Феҳристи номҳои миллӣ» (Қарори Ҳукумати ҶТ №98 аз 26.02.2026).
Извлекает все имена из DOCX, сопоставляет с существующей базой имён,
выполняет этимологическое и морфологическое обогащение,
генерирует CSV файлы и TypeScript/JSON датасет для фронтенда и Supabase.
"""

import zipfile
import xml.etree.ElementTree as ET
import csv
import json
import os
import re
import glob

ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

DOCX_PATH = '/Users/ibragimov/obsidian/Projects/GitHub/name-navigator/Фехристи номхои милли 20.01.2026.docx'
ROOT_CSV_PATH = '/Users/ibragimov/obsidian/Projects/GitHub/name-navigator/Фехристи номхои милли 20.01.2026.csv'
DATA_CSV_PATH = '/Users/ibragimov/obsidian/Projects/GitHub/name-navigator/data/tajik_national_names.csv'
SRC_DATA_TS = '/Users/ibragimov/obsidian/Projects/GitHub/name-navigator/src/data/tajikRegistryData.json'

# --- 1. ТАДЖИКСКО-ПЕРСИДСКИЕ И АРАБСКИЕ ЭТИМОЛОГИЧЕСКИЕ СЛОВАРИ И КОРНИ ---

ROOT_MEANINGS_TJ = {
    # Префиксы и основы
    'гул': ('Цветок, роза, цветущая красота', ['красота', 'природа', 'нежность'], 'Тоҷикӣ / Форсӣ'),
    'моҳ': ('Луна, луноликая красота, сияние', ['красота', 'свет', 'лучезарность'], 'Тоҷикӣ / Форсӣ'),
    'маҳ': ('Луна, возлюбленная', ['красота', 'свет'], 'Тоҷикӣ / Форсӣ'),
    'зар': ('Золото, драгоценность, сияние', ['богатство', 'благородство', 'драгоценность'], 'Тоҷикӣ / Форсӣ'),
    'заррин': ('Золотой, драгоценный, сверкающий', ['благородство', 'красота'], 'Тоҷикӣ / Форсӣ'),
    'дил': ('Сердце, душа, искренность', ['доброта', 'любовь', 'душевность'], 'Тоҷикӣ / Форсӣ'),
    'нур': ('Божественный свет, сияние веры', ['свет', 'вера', 'мудрость'], 'Арабӣ / Тоҷикӣ'),
    'меҳр': ('Любовь, солнце, милосердие, доброта', ['доброта', 'милосердие', 'любовь'], 'Тоҷикӣ / Форсӣ'),
    'хуршед': ('Солнце, сияющее светило', ['свет', 'величие', 'энергия'], 'Тоҷикӣ / Форсӣ'),
    'шоҳ': ('Царь, правитель, благородный', ['величие', 'лидерство', 'благородство'], 'Тоҷикӣ / Форсӣ'),
    'шаҳ': ('Царь, владыка, правитель', ['величие', 'лидерство', 'авторитет'], 'Тоҷикӣ / Форсӣ'),
    'беҳ': ('Лучший, превосходный, благой', ['совершенство', 'доброта'], 'Тоҷикӣ / Форсӣ'),
    'фирӯз': ('Победоносный, бирюза, приносящий триумф', ['победа', 'успех', 'сила'], 'Тоҷикӣ / Форсӣ'),
    'парвиз': ('Удачливый, победоносный, благородный', ['успех', 'лидерство', 'счастье'], 'Тоҷикӣ / Форсӣ'),
    'рустам': ('Могучий богатырь, храбрец из «Шахнаме»', ['сила', 'мужество', 'героизм'], 'Тоҷикӣ / Форсӣ'),
    'сомон': ('Устроитель порядка, мир, покой, основатель государства', ['мудрость', 'лидерство', 'созидание'], 'Тоҷикӣ / Форсӣ'),
    'сино': ('Мудрец, учёный (в честь Ибн Сины / Авиценны)', ['знание', 'мудрость', 'наука'], 'Тоҷикӣ / Форсӣ'),
    'бахт': ('Счастье, удача, благословение', ['счастье', 'удача', 'благословение'], 'Тоҷикӣ / Форсӣ'),
    'фар': ('Божественная слава, величие, харизма', ['величие', 'слава', 'достоинство'], 'Тоҷикӣ / Форсӣ'),
    'фарҳанг': ('Культура, знание, просвещение', ['мудрость', 'знание', 'культура'], 'Тоҷикӣ / Форсӣ'),
    'фарзона': ('Мудрая, мыслящая, высокообразованная', ['мудрость', 'интеллект'], 'Тоҷикӣ / Форсӣ'),
    'фарҳод': ('Понятливый, способный, самоотверженный герой', ['мужество', 'верность'], 'Тоҷикӣ / Форсӣ'),
    'шаҳром': ('Спокойный правитель, мирный царь', ['мир', 'спокойствие', 'лидерство'], 'Тоҷикӣ / Форсӣ'),
    'шаҳбоз': ('Царский сокол, отважный и зоркий', ['храбрость', 'зоркость', 'величие'], 'Тоҷикӣ / Форсӣ'),
    'ҷамшед': ('Лучезарный царь, созидатель, легендарный правитель', ['величие', 'культура', 'свет'], 'Тоҷикӣ / Форсӣ'),
    'суҳроб': ('Рубиноволикий, пламенный богатырь', ['мужество', 'сила', 'красота'], 'Тоҷикӣ / Форсӣ'),
    'таҳмина': ('Сильная, смелая, отважная мать богатыря', ['сила', 'верность', 'мужество'], 'Тоҷикӣ / Форсӣ'),
    'амир': ('Повелитель, князь, командующий', ['лидерство', 'власть', 'честь'], 'Арабӣ'),
    'асад': ('Лев, храбрый, могучий', ['сила', 'мужество', 'храбрость'], 'Арабӣ'),
    'амин': ('Верный, надежный, честный', ['честность', 'верность', 'надежность'], 'Арабӣ'),
    'азиз': ('Дорогой, уважаемый, могущественный', ['уважение', 'любовь', 'достоинство'], 'Арабӣ'),
    'карим': ('Щедрый, великодушный, благородный', ['щедрость', 'благородство', 'доброта'], 'Арабӣ'),
    'ҳаким': ('Мудрец, знаток, лекарь', ['мудрость', 'знание', 'справедливость'], 'Арабӣ'),
    'ҳамид': ('Восхваляемый, достойный похвалы', ['благодарность', 'честь'], 'Арабӣ'),
    'саид': ('Счастливый, благословенный, господин', ['счастье', 'благородство'], 'Арабӣ'),
    'салим': ('Здоровый, невредимый, миролюбивый', ['здоровье', 'мир', 'чистота'], 'Арабӣ'),
    'солеҳ': ('Праведный, благочестивый, добрый', ['праведность', 'вера', 'доброта'], 'Арабӣ'),
    'тоҳир': ('Чистый, непорочный, святой', ['чистота', 'праведность'], 'Арабӣ'),
    'мансур': ('Побеждающий, находящийся под защитой Всевышнего', ['победа', 'помощь'], 'Арабӣ'),
    'нодир': ('Редкий, драгоценный, исключительный', ['уникальность', 'ценность'], 'Арабӣ'),
    'вафо': ('Верность, преданность, верность слову', ['верность', 'честность'], 'Арабӣ / Тоҷикӣ'),
    'ёсамин': ('Жасмин, нежный благоухающий цветок', ['красота', 'нежность'], 'Тоҷикӣ / Форсӣ'),
    'нафиса': ('Изящная, тонкая, драгоценная', ['изящество', 'красота'], 'Арабӣ'),
    'нигина': ('Драгоценный камень в перстне, сокровище', ['красота', 'драгоценность'], 'Тоҷикӣ / Форсӣ'),
    'наргис': ('Нарцисс, прекрасный цветок с пленительным взглядом', ['красота', 'нежность'], 'Тоҷикӣ / Форсӣ'),
    'нигора': ('Красавица, картина, узор', ['красота', 'изящество', 'искусство'], 'Тоҷикӣ / Форсӣ'),
    'лола': ('Тюльпан, символ весны и расцвета', ['красота', 'весна', 'природа'], 'Тоҷикӣ / Форсӣ'),
    'раъно': ('Прекрасная, грациозная, статная', ['красота', 'изящество'], 'Арабӣ / Тоҷикӣ'),
    'ширин': ('Сладкая, приятная, очаровательная', ['очарование', 'доброта', 'нежность'], 'Тоҷикӣ / Форсӣ'),
    'шабнам': ('Утренняя роса, чистота и свежесть', ['чистота', 'свежесть', 'нежность'], 'Тоҷикӣ / Форсӣ'),
    'пари': ('Прекрасная фея, сказочная красавица', ['красота', 'волшебство'], 'Тоҷикӣ / Форсӣ'),
    'сурайё': ('Созвездие Плеяды, яркие звёзды', ['свет', 'высота', 'красота'], 'Арабӣ / Тоҷикӣ'),
    'ситора': ('Звезда, путеводный свет', ['свет', 'красота', 'надежда'], 'Тоҷикӣ / Форсӣ'),
    'хуррам': ('Радостный, цветущий, веселый', ['радость', 'жизнелюбие'], 'Тоҷикӣ / Форсӣ'),
    'ҷаҳон': ('Мир, вселенная, простор', ['величие', 'вселенная'], 'Тоҷикӣ / Форсӣ'),
    'дониш': ('Знание, мудрость, разум', ['мудрость', 'знание', 'интеллект'], 'Тоҷикӣ / Форсӣ'),
    'комрон': ('Успешный, удачливый, достигший цели', ['успех', 'лидерство', 'целеустремленность'], 'Тоҷикӣ / Форсӣ'),
    'хушнуд': ('Довольный, радостный, счастливый', ['счастье', 'радость'], 'Тоҷикӣ / Форсӣ'),
}

# Суффиксы
SUFFIX_MEANINGS = {
    'бону': ('Почтенная госпожа, знатная дама', ['благородство', 'почёт'], 'Тоҷикӣ / Форсӣ'),
    'бегим': ('Знатная дама, госпожа', ['величие', 'почёт'], 'Тоҷикӣ / Форсӣ'),
    'духт': ('Дочь, юная дева', ['семья', 'нежность'], 'Тоҷикӣ / Форсӣ'),
    'зода': ('Рождённый в благородстве, потомок', ['происхождение', 'честь'], 'Тоҷикӣ / Форсӣ'),
    'пур': ('Сын, преемник', ['наследие', 'сила'], 'Тоҷикӣ / Форсӣ'),
    'ёр': ('Друг, верный спутник, помощник', ['дружба', 'верность'], 'Тоҷикӣ / Форсӣ'),
    'рӯ': ('С прекрасным ликом, с сияющим лицом', ['красота', 'свет'], 'Тоҷикӣ / Форсӣ'),
    'чеҳра': ('С благородным лицом, прекрасноликая', ['красота', 'изящество'], 'Тоҷикӣ / Форсӣ'),
    'ваш': ('Подобная, похожая на прелесть', ['красота', 'изящество'], 'Тоҷикӣ / Форсӣ'),
    'нигор': ('Красавица, узорная, живописная', ['красота', 'искусство'], 'Тоҷикӣ / Форсӣ'),
    'ноз': ('Грациозная, полная нежности и кокетства', ['нежность', 'изящество'], 'Тоҷикӣ / Форсӣ'),
    'хон': ('Господин, владыка, хан', ['авторитет', 'почёт'], 'Тоҷикӣ / Тюркӣ'),
    'ҷон': ('Душа, дорогой сердцу, любимый', ['душевность', 'любовь'], 'Тоҷикӣ / Форсӣ'),
    'тоҷ': ('Венец, корона, вершина достоинства', ['величие', 'достоинство'], 'Тоҷикӣ / Форсӣ'),
    'афрӯз': ('Озаряющий, приносящий свет и радость', ['свет', 'радость'], 'Тоҷикӣ / Форсӣ'),
    'парвар': ('Опекающий, воспитывающий, заботливый', ['забота', 'доброта'], 'Тоҷикӣ / Форсӣ'),
    'бахш': ('Дарующий, приносящий благословение', ['щедрость', 'благодать'], 'Тоҷикӣ / Форсӣ'),
    'оро': ('Украшающий, гармоничный', ['красота', 'созидание'], 'Тоҷикӣ / Форсӣ'),
    'офар': ('Создающий, творящий благо', ['творчество', 'созидание'], 'Тоҷикӣ / Форсӣ'),
    'ангез': ('Пробуждающий прекрасные чувства', ['вдохновение', 'любовь'], 'Тоҷикӣ / Форсӣ'),
    'нисо': ('Женщины, венец женственности', ['женственность', 'красота'], 'Арабӣ'),
    'дин': ('Вера, религия, преданность пути Аллаха', ['вера', 'праведность'], 'Арабӣ'),
    'уллоҳ': ('Принадлежащий Аллаху, под сенью Всевышнего', ['вера', 'благословение'], 'Арабӣ'),
    'аллоҳ': ('Принадлежащий Аллаху', ['вера', 'благословение'], 'Арабӣ'),
}

# Имена Абду + 99 имён Всевышнего
ABDU_MAP = {
    'абдуллоҳ': 'Слуга Аллаха (Всевышнего Господа)',
    'абдулло': 'Слуга Аллаха',
    'абдураҳмон': 'Слуга Милостивого (Ар-Рахман)',
    'абдураҳим': 'Слуга Милосердного (Ар-Рахим)',
    'абдулмалик': 'Слуга Владыки всего сущего (Аль-Малик)',
    'абдулқуддус': 'Слуга Священного (Аль-Куддус)',
    'абдусалом': 'Слуга Источника мира и безопасности (Ас-Салям)',
    'абдулмуъмин': 'Слуга Оберегающего веру (Аль-Мумин)',
    'абдулмуҳаймин': 'Слуга Хранителя (Аль-Мухаймин)',
    'абдулазиз': 'Слуга Могущественного и Непобедимого (Аль-Азиз)',
    'абдуҷаббор': 'Слуга Подчиняющего Своей воле (Аль-Джаббар)',
    'абдулмутакаббир': 'Слуга Превознесенного (Аль-Мутакаббир)',
    'абдулхолиқ': 'Слуга Творца всего мироздания (Аль-Халик)',
    'абдулборӣ': 'Слуга Создателя (Аль-Бари)',
    'абдулмусаввир': 'Слуга Придающего облик (Аль-Мусаввир)',
    'абдулғаффор': 'Слуга Всепрощающего (Аль-Гаффар)',
    'абдулқаҳҳор': 'Слуга Всепокоряющего (Аль-Каххар)',
    'абдулваҳҳоб': 'Слуга Дарующего блага безвозмездно (Аль-Ваххаб)',
    'абдурраззоқ': 'Слуга Дарующего пропитание (Ар-Раззак)',
    'абдулфаттоҳ': 'Слуга Открывающего врата милости (Аль-Фаттах)',
    'абдулалим': 'Слуга Всезнающего (Аль-Алим)',
    'абдулбосит': 'Слуга Щедро одаряющего (Аль-Басит)',
    'абдулхофиз': 'Слуга Принижающего горделивых (Аль-Хафид)',
    'абдуррофеъ': 'Слуга Возвышающего праведников (Ар-Рафи)',
    'абдулмуизз': 'Слуга Возвеличивающего (Аль-Муизз)',
    'абдулмузилл': 'Слуга Принижающего недостойных (Аль-Музилль)',
    'абдуссамеъ': 'Слуга Всеслышащего (Ас-Сами)',
    'абдулбасир': 'Слуга Всевидящего (Аль-Басир)',
    'абдулҳакам': 'Слуга Справедливого Судьи (Аль-Хакам)',
    'абдуладл': 'Слуга Абсолютно Справедливого (Аль-Адль)',
    'абдуллатиф': 'Слуга Проницательного и Доброго (Аль-Латиф)',
    'абдулхабир': 'Слуга Всеведающего (Аль-Хабир)',
    'абдулҳалим': 'Слуга Кроткого и Снисходительного (Аль-Халим)',
    'абдулазим': 'Слуга Величайшего (Аль-Азим)',
    'абдулғафур': 'Слуга Многопрощающего (Аль-Гафур)',
    'абдушакур': 'Слуга Благодарного (Аш-Шакур)',
    'абдулалӣ': 'Слуга Высочайшего (Аль-Али)',
    'абдулкабир': 'Слуга Великого (Аль-Кабир)',
    'абдулҳафиз': 'Слуга Хранителя (Аль-Хафиз)',
    'абдулмуқит': 'Слуга Поддерживающего Свои творения (Аль-Мукит)',
    'абдулҳасиб': 'Слуга Достаточного для упования (Аль-Хасиб)',
    'абдулҷалил': 'Слуга Величественного (Аль-Джалиль)',
    'абдулкарим': 'Слуга Великодушного и Щедрого (Аль-Карим)',
    'абдурраққиб': 'Слуга Наблюдающего за всем (Ар-Ракиб)',
    'абдулмуҷиб': 'Слуга Внимающего молитвам (Аль-Муджиб)',
    'абдулвосеъ': 'Слуга Безгранично Объемлющего милостью (Аль-Васи)',
    'абдулҳаким': 'Слуга Премудрого (Аль-Хаким)',
    'абдулвадуд': 'Слуга Любящего Своих рабов (Аль-Вадуд)',
    'абдулмаҷид': 'Слуга Славного (Аль-Маджид)',
    'абдулбоис': 'Слуга Воскрешающего (Аль-Баис)',
    'абдушаҳид': 'Слуга Свидетеля всего сущего (Аш-Шахид)',
    'абдулҳаққ': 'Слуга Истинного (Аль-Хакк)',
    'абдулвакил': 'Слуга Попечителя и Покровителя (Аль-Вакиль)',
    'абдулқавӣ': 'Слуга Всесильного (Аль-Кави)',
    'абдулматин': 'Слуга Непоколебимого (Аль-Матин)',
    'абдулвалӣ': 'Слуга Близкого Защитника (Аль-Вали)',
    'абдулҳамид': 'Слуга Достохвального (Аль-Хамид)',
    'абдулмуҳсӣ': 'Слуга Ведущего точный счёт всему (Аль-Мухси)',
    'абдулмубдиъ': 'Слуга Создающего из небытия (Аль-Мубди)',
    'абдулмуъид': 'Слуга Возвращающего к жизни (Аль-Муид)',
    'абдулмуҳйӣ': 'Слуга Оживляющего (Аль-Мухьи)',
    'абдулмумит': 'Слуга Умерщвляющего (Аль-Мумит)',
    'абдулҳайй': 'Слуга Вечно Живого (Аль-Хайй)',
    'абдулқайюм': 'Слуга Самосущего (Аль-Кайюм)',
    'абдулвоҷид': 'Слуга Находящего всё желаемое (Аль-Ваджид)',
    'абдулмоҷид': 'Слуга Благородного (Аль-Маджид)',
    'абдулвоҳид': 'Слуга Единственного (Аль-Вахид)',
    'абдулаҳад': 'Слуга Единого (Аль-Ахад)',
    'абдуссамад': 'Слуга Вечного и Ни в ком не нуждающегося (Ас-Самад)',
    'абдулқодир': 'Слуга Всемогущего (Аль-Кадир)',
    'абдулмуқтадир': 'Слуга Могущественного Вершителя (Аль-Муктадир)',
    'абдулмуқаддим': 'Слуга Выдвигающего вперёд (Аль-Мукаддим)',
    'абдулмуаххир': 'Слуга Отодвигающего назад (Аль-Муаххир)',
    'абдулаввал': 'Слуга Первого без начала (Аль-Авваль)',
    'абдулохир': 'Слуга Последнего без конца (Аль-Ахир)',
    'абдуззоҳир': 'Слуга Явного (Аз-Захир)',
    'абдулботин': 'Слуга Сокрытого (Аль-Батин)',
    'абдулволӣ': 'Слуга Правящего Владыки (Аль-Вали)',
    'абдулмутаолӣ': 'Слуга Высочайшего над всем (Аль-Мутаали)',
    'абдулбарр': 'Слуга Благодетельного (Аль-Барр)',
    'абдуттаввоб': 'Слуга Принимающего покаяние (Ат-Тавваб)',
    'абдулмунтақим': 'Слуга Воздающего по справедливости (Аль-Мунтаким)',
    'абдулафувв': 'Слуга Изглаживающего грехи (Аль-Афувв)',
    'абдуррауф': 'Слуга Сострадательного (Ар-Рауф)',
    'абдулғайюр': 'Слуга Ревнителя истины',
    'абдулғанӣ': 'Слуга Истинно Богатого и Самодостаточного (Аль-Гани)',
    'абдулмуғнӣ': 'Слуга Обогащающего Своих рабов (Аль-Мугни)',
    'абдулмонеъ': 'Слуга Удерживающего зло (Аль-Мани)',
    'абдуззорр': 'Слуга Лишающего грешников милости (Ад-Дарр)',
    'абдуннофеъ': 'Слуга Приносящего благо (Ан-Нафи)',
    'абдуннур': 'Слуга Света небес и земли (Ан-Нур)',
    'абдулҳодӣ': 'Слуга Направляющего на прямой путь (Аль-Хади)',
    'абдулбадеъ': 'Слуга Бесподобного Творца (Аль-Бади)',
    'абдулбоқӣ': 'Слуга Вечно Пребывающего (Аль-Баки)',
    'абдулворис': 'Слуга Истинного Наследника всего сущего (Аль-Варис)',
    'абдуррашид': 'Слуга Ведущего к верному пути (Ар-Рашид)',
    'абдуссабур': 'Слуга Безгранично Терпеливого (Ас-Сабур)',
    'абдусаттор': 'Слуга Покрывающего человеческие недостатки (Ас-Саттар)',
    'абдулғаффор': 'Слуга Всепрощающего Владыки (Аль-Гаффар)',
}

def to_title_case_tj(text: str) -> str:
    """Преобразует таджикский текст в Title Case с учётом апострофов и дефисов."""
    if not text:
        return ""
    text = text.strip()
    parts = re.split(r'([\s\-])', text)
    result = []
    for part in parts:
        if not part or part in [' ', '-']:
            result.append(part)
            continue
        part_lower = part.lower()
        if len(part_lower) == 1:
            result.append(part_lower.upper())
        else:
            result.append(part_lower[0].upper() + part_lower[1:])
    return ''.join(result)

def make_slug(name_latin: str, name_tj: str, gender: str, index: int) -> str:
    clean = re.sub(r'[^a-zA-Z0-9]', '', name_latin.lower())
    if not clean:
        clean = re.sub(r'[^a-zA-Z0-9]', '', name_tj.lower())
    prefix = 'tj_f' if gender == 'female' else 'tj_m'
    return f"{prefix}_{clean}_{index}" if clean else f"{prefix}_{index}"

def canonical_key(s: str) -> str:
    """Канонический ключ для сопоставления между орфографиями."""
    if not s:
        return ""
    s = s.lower().strip()
    s = re.sub(r'[\'\"’ʻ`ъь\s\-]', '', s)
    s = s.replace('ҳ', 'х').replace('ҷ', 'дж').replace('ӯ', 'у').replace('ғ', 'г').replace('қ', 'к').replace('ӣ', 'и')
    s = s.replace('дж', 'ж')
    s = s.replace('д', 'т').replace('з', 'с').replace('б', 'п').replace('г', 'к')
    s = s.replace('о', 'а').replace('е', 'и').replace('э', 'и').replace('я', 'а').replace('ю', 'у')
    s = re.sub(r'(.)\1+', r'\1', s)
    return s

def load_existing_system_names():
    """Загружает существующие имена из src/data/names/**/*.ts и data/names.json."""
    existing_exact = {}
    existing_canonical = {}

    # 1. TS файлы
    ts_files = glob.glob('src/data/names/**/*.ts', recursive=True)
    for f in ts_files:
        if 'index.ts' in f or '_registry' in f:
            continue
        try:
            with open(f, 'r', encoding='utf-8') as fp:
                content = fp.read()
                pattern = re.compile(r'\{\s*id:\s*["\']([^"\']+)["\'],\s*name:\s*["\']([^"\']+)["\'](.*?)\}', re.DOTALL)
                for m in pattern.finditer(content):
                    name_id = m.group(1)
                    name_display = m.group(2)
                    body = m.group(3)

                    meaning_m = re.search(r'meaning:\s*["\']([^"\']+)["\']', body)
                    origin_m = re.search(r'origin:\s*["\']([^"\']+)["\']', body)
                    culture_m = re.search(r'culture:\s*["\']([^"\']+)["\']', body)
                    history_m = re.search(r'history:\s*["\']([^"\']+)["\']', body)
                    attrs_m = re.search(r'attributes:\s*\[(.*?)\]', body)

                    attributes = []
                    if attrs_m:
                        attributes = [x.strip(' "\'') for x in attrs_m.group(1).split(',') if x.strip(' "\'')]

                    data = {
                        'id': name_id,
                        'name': name_display,
                        'meaning': meaning_m.group(1) if meaning_m else '',
                        'origin': origin_m.group(1) if origin_m else 'Тоҷикӣ / Форсӣ',
                        'culture': culture_m.group(1) if culture_m else 'Таджикская',
                        'history': history_m.group(1) if history_m else '',
                        'attributes': attributes
                    }
                    existing_exact[name_display.strip().lower()] = data
                    existing_exact[name_id.strip().lower()] = data
                    c_key = canonical_key(name_display)
                    if c_key and c_key not in existing_canonical:
                        existing_canonical[c_key] = data
        except Exception as e:
            print(f"Warning reading {f}: {e}")

    # 2. data/names.json
    if os.path.exists('data/names.json'):
        try:
            with open('data/names.json', 'r', encoding='utf-8') as fp:
                json_data = json.load(fp)
                if isinstance(json_data, list):
                    for item in json_data:
                        if 'name' in item:
                            n_key = item['name'].strip().lower()
                            data = {
                                'id': item.get('id', ''),
                                'name': item['name'],
                                'meaning': item.get('meaning', ''),
                                'origin': item.get('origin', 'Тоҷикӣ / Форсӣ'),
                                'culture': item.get('culture', 'Таджикская'),
                                'history': item.get('history', ''),
                                'attributes': item.get('attributes', [])
                            }
                            if n_key not in existing_exact:
                                existing_exact[n_key] = data
                            c_key = canonical_key(item['name'])
                            if c_key and c_key not in existing_canonical:
                                existing_canonical[c_key] = data
        except Exception as e:
            print(f"Warning reading data/names.json: {e}")

    print(f"Loaded {len(existing_exact)} exact records, {len(existing_canonical)} canonical patterns.")
    return existing_exact, existing_canonical

def match_existing_data(name_tj: str, name_cyrillic: str, name_latin: str, existing_exact: dict, existing_canonical: dict):
    keys_to_try = [
        name_tj.lower(),
        name_cyrillic.lower(),
        name_latin.lower(),
    ]
    tj_normalized = (name_tj.lower()
                     .replace('ҳ', 'х')
                     .replace('ҷ', 'дж')
                     .replace('ӯ', 'у')
                     .replace('ғ', 'г')
                     .replace('қ', 'к')
                     .replace('ӣ', 'и')
                     .replace('ъ', ''))
    keys_to_try.append(tj_normalized)
    
    tj_normalized2 = (name_tj.lower()
                      .replace('ҳ', 'х')
                      .replace('ҷ', 'ж')
                      .replace('ӯ', 'у')
                      .replace('ғ', 'г')
                      .replace('қ', 'к')
                      .replace('ӣ', 'и')
                      .replace('ъ', ''))
    keys_to_try.append(tj_normalized2)

    for k in keys_to_try:
        if k in existing_exact:
            return existing_exact[k]

    c_tj = canonical_key(name_tj)
    if c_tj in existing_canonical:
        return existing_canonical[c_tj]

    c_cyr = canonical_key(name_cyrillic)
    if c_cyr in existing_canonical:
        return existing_canonical[c_cyr]

    return None

def decompose_tajik_name(name_tj: str, gender: str) -> dict:
    """Интеллектуальная этимологическая декомпозиция таджикско-персидских и арабских имён."""
    name_lower = name_tj.lower().strip()
    
    # 1. Проверка Абду + имена Всевышнего
    for k, v in ABDU_MAP.items():
        if name_lower == k or name_lower == k.replace('ҳ', 'х') or name_lower.startswith(k):
            return {
                'meaning': f"Мусульманское имя со значением: «{v}». Принадлежит к категории благородных теофорных имён.",
                'origin': 'Арабӣ / Мусулмонӣ',
                'attributes': ['вера', 'благочестие', 'божественная защита', 'национальное'],
                'history': 'Официальное разрешённое мусульманское имя в Реестре национальных имён РТ (№98).'
            }

    # 2. Поиск совпадений по префиксам и суффиксам
    meaning_parts = []
    attributes_set = set(['национальное', 'официальное'])
    origin = 'Тоҷикӣ / Форсӣ'

    # Поиск префикса
    found_prefix = None
    for prefix, (p_meaning, p_attrs, p_orig) in ROOT_MEANINGS_TJ.items():
        if name_lower.startswith(prefix) and len(name_lower) >= len(prefix):
            found_prefix = (prefix, p_meaning, p_attrs, p_orig)
            break

    # Поиск суффикса
    found_suffix = None
    for suffix, (s_meaning, s_attrs, s_orig) in SUFFIX_MEANINGS.items():
        if name_lower.endswith(suffix) and len(name_lower) > len(suffix):
            found_suffix = (suffix, s_meaning, s_attrs, s_orig)
            break

    if found_prefix and found_suffix and found_prefix[0] != found_suffix[0]:
        meaning_parts.append(f"{found_prefix[1]} в сочетании со значением «{found_suffix[1]}»")
        for a in found_prefix[2] + found_suffix[2]:
            attributes_set.add(a)
        origin = found_prefix[3]
    elif found_prefix:
        rest = name_lower[len(found_prefix[0]):]
        if rest:
            meaning_parts.append(f"Образовано от корня «{found_prefix[0]}» ({found_prefix[1]})")
        else:
            meaning_parts.append(found_prefix[1])
        for a in found_prefix[2]:
            attributes_set.add(a)
        origin = found_prefix[3]
    elif found_suffix:
        stem = name_lower[:-len(found_suffix[0])]
        meaning_parts.append(f"Имя с благородным компонентом «-{found_suffix[0]}» ({found_suffix[1]})")
        for a in found_suffix[2]:
            attributes_set.add(a)
        origin = found_suffix[3]

    if meaning_parts:
        if gender == 'female':
            attributes_set.add('женственность')
            attributes_set.add('красота')
        else:
            attributes_set.add('благородство')
            attributes_set.add('достоинство')

        return {
            'meaning': '; '.join(meaning_parts) + f". Традиционное таджикское национальное имя ({'женское' if gender == 'female' else 'мужское'}).",
            'origin': origin,
            'attributes': sorted(list(attributes_set)),
            'history': 'Включено в официальный Феҳристи номҳои миллии Ҷумҳурии Тоҷикистон (Қарори №98).'
        }

    return None

def parse_docx():
    print(f"Reading docx from {DOCX_PATH}...")
    with zipfile.ZipFile(DOCX_PATH) as docx:
        tree = ET.fromstring(docx.read('word/document.xml'))
        tables = tree.findall('.//w:tbl', ns)

    existing_exact, existing_canonical = load_existing_system_names()

    all_records = []
    table_configs = [
        (tables[0], 'female', 'духтарона'),
        (tables[1], 'male', 'писарона')
    ]

    matched_count = 0
    decomposed_count = 0

    for t_idx, (table, gender, gender_tj) in enumerate(table_configs):
        rows = table.findall('.//w:tr', ns)
        current_letter = ''
        gender_num = 0

        for r_idx, row in enumerate(rows):
            cells = row.findall('.//w:tc', ns)
            row_text = [' '.join(''.join(c.itertext()).split()) for c in cells]
            non_empty = [c for c in row_text if c]

            if not non_empty or 'НОМҲОИ' in ''.join(non_empty) or 'Тоҷикӣ' in non_empty or 'Овонавишти' in ''.join(non_empty):
                continue

            if len(non_empty) == 1 and len(non_empty[0]) <= 3:
                current_letter = non_empty[0].strip()
                continue

            raw_num = row_text[0] if len(row_text) > 0 else ''
            raw_name_tj = row_text[1] if len(row_text) > 1 else ''
            raw_name_cyrillic = row_text[2] if len(row_text) > 2 else ''
            raw_name_latin = row_text[3] if len(row_text) > 3 else ''

            if not raw_name_tj:
                for c in non_empty:
                    if len(c) > 1:
                        raw_name_tj = c
                        break

            if not raw_name_tj:
                continue

            gender_num += 1
            raw_name_tj = raw_name_tj.strip()
            raw_name_cyrillic = (raw_name_cyrillic.strip() if raw_name_cyrillic else raw_name_tj)
            raw_name_latin = raw_name_latin.strip()

            letter = current_letter if current_letter else raw_name_tj[0].upper()

            name_display_tj = to_title_case_tj(raw_name_tj)
            name_display_cyrillic = to_title_case_tj(raw_name_cyrillic)
            name_display_latin = to_title_case_tj(raw_name_latin)

            slug = make_slug(raw_name_latin, raw_name_tj, gender, gender_num)

            # 1. Поиск в существующей богатой базе
            matched = match_existing_data(name_display_tj, name_display_cyrillic, name_display_latin, existing_exact, existing_canonical)
            
            is_enriched = False
            meaning = ""
            origin = "Тоҷикӣ / Форсӣ"
            attributes = ['национальное', 'официальное']
            history = ""
            matched_id = ""

            if matched:
                matched_count += 1
                is_enriched = True
                matched_id = matched.get('id', '')
                meaning = matched.get('meaning', '')
                origin = matched.get('origin', 'Тоҷикӣ / Форсӣ')
                attributes = matched.get('attributes', ['национальное'])
                history = matched.get('history', '')
            else:
                # 2. Морфологическая декомпозиция таджикско-персидских и арабских корней
                decomposed = decompose_tajik_name(name_display_tj, gender)
                if decomposed:
                    decomposed_count += 1
                    is_enriched = True
                    meaning = decomposed['meaning']
                    origin = decomposed['origin']
                    attributes = decomposed['attributes']
                    history = decomposed['history']

            record = {
                'id': slug,
                'num': gender_num,
                'name_tj': name_display_tj,
                'name_tj_raw': raw_name_tj,
                'name_cyrillic': name_display_cyrillic,
                'name_cyrillic_raw': raw_name_cyrillic,
                'name_latin': name_display_latin,
                'name_latin_raw': raw_name_latin,
                'gender': gender,
                'gender_label': 'Женский' if gender == 'female' else 'Мужской',
                'gender_tj': 'Духтарона' if gender == 'female' else 'Писарона',
                'letter': letter,
                'is_official_permitted': True,
                'legal_decree': 'Қарори Ҳукумати Ҷумҳурии Тоҷикистон аз 26 феврали соли 2026, №98',
                'is_enriched': is_enriched,
                'matched_child_name_id': matched_id,
                'meaning': meaning,
                'origin': origin,
                'attributes': attributes,
                'history': history,
            }
            all_records.append(record)

    print(f"Total parsed records: {len(all_records)}")
    print(f"Female count: {len([r for r in all_records if r['gender'] == 'female'])}")
    print(f"Male count: {len([r for r in all_records if r['gender'] == 'male'])}")
    print(f"Cross-matched with existing rich records: {matched_count}")
    print(f"Etymologically decomposed & enriched: {decomposed_count}")
    print(f"Total enriched names: {matched_count + decomposed_count} / {len(all_records)} ({(matched_count + decomposed_count) * 100 // len(all_records)}%)")

    csv_fieldnames = [
        'id', 'num', 'gender', 'gender_label', 'gender_tj', 'letter',
        'name_tj', 'name_cyrillic', 'name_latin',
        'name_tj_raw', 'name_cyrillic_raw', 'name_latin_raw',
        'is_official_permitted', 'legal_decree', 'is_enriched',
        'matched_child_name_id', 'meaning', 'origin', 'attributes', 'history'
    ]

    for path in [ROOT_CSV_PATH, DATA_CSV_PATH]:
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        with open(path, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=csv_fieldnames)
            writer.writeheader()
            for r in all_records:
                row_copy = dict(r)
                row_copy['attributes'] = '; '.join(row_copy['attributes']) if isinstance(row_copy['attributes'], list) else ''
                writer.writerow(row_copy)
        print(f"Saved CSV to {path} ({os.path.getsize(path)} bytes)")

    with open(SRC_DATA_TS, 'w', encoding='utf-8') as f:
        json.dump(all_records, f, ensure_ascii=False, indent=2)
    print(f"Saved Frontend Data to {SRC_DATA_TS} ({os.path.getsize(SRC_DATA_TS)} bytes)")

    return all_records

if __name__ == '__main__':
    parse_docx()
