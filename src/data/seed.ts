import type { TopicItem, QuizItem, PairItem, SentenceItem, HangmanItem, RevealItem, OddOneOutItem, WordSortItem, AnagramItem, EmojiStoryItem, BingoItem, PictionaryItem, TwentyQItem } from '@/types'

export const topicsSeed: TopicItem[] = [
  { id:'t1', text:'Describe your dream holiday', category:'Speaking', level:'A2' },
  { id:'t2', text:'What did you do last weekend?', category:'Past Tense', level:'A1' },
  { id:'t3', text:'Debate: Phones in school - yes or no?', category:'Debate', level:'B1' },
  { id:'t4', text:'Talk about your favourite food for 30 seconds', category:'Speaking', level:'A1' },
  { id:'t5', text:'If you were a super hero, what power...?', category:'Creative', level:'A2' },
  { id:'t6', text:'Explain the rules of your favourite game', category:'Explain', level:'B1' },
  { id:'t7', text:'Would you rather: live in city or countryside?', category:'Would you rather', level:'A2' },
  { id:'t8', text:'Describe a movie you love', category:'Speaking', level:'A2' },
]

export const quizSeed: QuizItem[] = [
  { id:'q1', category:'Grammar', question:'She ___ to school every day.', options:['go','goes','going','gone'], answerIndex:1, explain:'He/she/it + -s', level:'A1' },
  { id:'q2', category:'Vocab', question:'A place with many books', options:['bakery','library','stadium','airport'], answerIndex:1, level:'A1' },
  { id:'q3', category:'Grammar', question:'I ___ TV when he called.', options:['watched','was watching','watch','have watched'], answerIndex:1, level:'A2' },
  { id:'q4', category:'Vocab', question:'Synonym of "huge"', options:['tiny','enormous','weak','quick'], answerIndex:1, level:'A2' },
  { id:'q5', category:'Culture', question:'Capital of Australia?', options:['Sydney','Melbourne','Canberra','Perth'], answerIndex:2, level:'A2' },
  { id:'q6', category:'Grammar', question:'If it rains, we ___ inside.', options:['will stay','would stay','stayed','stay'], answerIndex:0, level:'B1' },
]

export const pairsSeed: PairItem[] = [
  { id:'p1', en:'apple', definition:'a red or green fruit', imageUrl:'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=200' },
  { id:'p2', en:'bicycle', definition:'two wheels you pedal', imageUrl:'https://images.unsplash.com/photo-1484156818044-c040038b0719?w=200' },
  { id:'p3', en:'library', definition:'place with books', imageUrl:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200' },
  { id:'p4', en:'mountain', definition:'very high hill', imageUrl:'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=200' },
  { id:'p5', en:'guitar', definition:'musical instrument with strings', imageUrl:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200' },
  { id:'p6', en:'ocean', definition:'big sea', imageUrl:'https://images.unsplash.com/photo-1505144808419-1957c155c484?w=200' },
]

export const sentencesSeed: SentenceItem[] = [
  { id:'s1', sentence:['She','has','never','been','to','London'], distractors:['have','to'], level:'A2' },
  { id:'s2', sentence:['We','are','going','to','play','football'], level:'A1' },
  { id:'s3', sentence:['If','I','were','you',',','I','would','study','harder'], level:'B1' },
  { id:'s4', sentence:['The','book','was','written','by','my','teacher'], level:'A2' },
]

export const hangmanSeed: HangmanItem[] = [
  { id:'h1', word:'LIBRARY', hint:'Place with many books' },
  { id:'h2', word:'BICYCLE', hint:'Two wheels, you pedal' },
  { id:'h3', word:'HOLIDAY', hint:'No school, time to relax' },
  { id:'h4', word:'ENORMOUS', hint:'Very big synonym' },
  { id:'h5', word:'KITCHEN', hint:'You cook here' },
]

export const revealSeed: RevealItem[] = [
  { id:'r1', word:'VOLCANO', image:'https://images.unsplash.com/photo-1506467491620-9d2812d64a80?w=600', hint:'Mountain that erupts' },
  { id:'r2', word:'PYRAMID', image:'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600', hint:'Egypt, triangle building' },
  { id:'r3', word:'RAINBOW', image:'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600', hint:'Colors after rain' },
]

export const oddOneOutSeed: OddOneOutItem[] = [
  { id:'o1', options:['apple','banana','carrot','grape'], answerIndex:2, reason:'carrot is a vegetable, others are fruits', category:'Food', level:'A1' },
  { id:'o2', options:['run','jump','swim','beautiful'], answerIndex:3, reason:'beautiful is an adjective, others are verbs', category:'Grammar', level:'A2' },
  { id:'o3', options:['London','Paris','Tokyo','River'], answerIndex:3, reason:'River is not a city', category:'Geography', level:'A1' },
  { id:'o4', options:['happy','sad','angry','quickly'], answerIndex:3, reason:'quickly is an adverb, others are adjectives', category:'Grammar', level:'A2' },
  { id:'o5', options:['cat','dog','bird','table'], answerIndex:3, reason:'table is not an animal', category:'Vocab', level:'A1' },
  { id:'o6', options:['Monday','Tuesday','January','Wednesday'], answerIndex:2, reason:'January is a month, others are days', category:'Vocab', level:'A1' },
]

export const wordSortSeed: WordSortItem[] = [
  { id:'ws1', buckets:['Countable','Uncountable','Both'], words:[{text:'apple',bucketIndex:0},{text:'water',bucketIndex:1},{text:'chicken',bucketIndex:2},{text:'book',bucketIndex:0},{text:'rice',bucketIndex:1},{text:'pizza',bucketIndex:2}] },
  { id:'ws2', buckets:['Past','Present','Future'], words:[{text:'went',bucketIndex:0},{text:'go',bucketIndex:1},{text:'will go',bucketIndex:2},{text:'ate',bucketIndex:0},{text:'eating',bucketIndex:1},{text:'will eat',bucketIndex:2}] },
]

export const anagramSeed: AnagramItem[] = [
  { id:'a1', word:'ENGLISH', hint:'School subject you study' },
  { id:'a2', word:'LIBRARY', hint:'Place with books' },
  { id:'a3', word:'HOLIDAY', hint:'No school!' },
  { id:'a4', word:'BICYCLE', hint:'Two wheels' },
  { id:'a5', word:'KITCHEN', hint:'You cook here' },
  { id:'a6', word:'GARDEN', hint:'Flowers grow here' },
]

export const emojiStorySeed: EmojiStoryItem[] = [
  { id:'e1', emojis:'👨‍🍳 🍕 🔥', answer:['The','chef','cooks','pizza'], hint:'kitchen' },
  { id:'e2', emojis:'🐱 🏃 🌳', answer:['The','cat','runs','to','the','tree'], hint:'animal' },
  { id:'e3', emojis:'👧 📚 😊', answer:['The','girl','reads','happily'], hint:'emotion' },
  { id:'e4', emojis:'⚽ 🥅 🎉', answer:['We','scored','a','goal'], hint:'sport' },
]

export const bingoSeed: BingoItem[] = [
  { id:'b1', word:'apple', definition:'fruit' }, { id:'b2', word:'book', definition:'you read it' },
  { id:'b3', word:'cat', definition:'animal' }, { id:'b4', word:'river', definition:'water flows' },
  { id:'b5', word:'happy', definition:'feeling good' }, { id:'b6', word:'quickly', definition:'fast' },
  { id:'b7', word:'school', definition:'you learn here' }, { id:'b8', word:'garden', definition:'flowers' },
  { id:'b9', word:'music', definition:'you listen' }, { id:'b10', word:'travel', definition:'go places' },
  { id:'b11', word:'family', definition:'mom dad kids' }, { id:'b12', word:'holiday', definition:'no school' },
  { id:'b13', word:'kitchen', definition:'cook here' }, { id:'b14', word:'library', definition:'books' },
  { id:'b15', word:'mountain', definition:'high hill' }, { id:'b16', word:'ocean', definition:'big sea' },
  { id:'b17', word:'friend', definition:'person you like' }, { id:'b18', word:'guitar', definition:'instrument' },
  { id:'b19', word:'bicycle', definition:'two wheels' }, { id:'b20', word:'volcano', definition:'erupts' },
  { id:'b21', word:'pyramid', definition:'Egypt' }, { id:'b22', word:'rainbow', definition:'colors' },
  { id:'b23', word:'teacher', definition:'teaches' }, { id:'b24', word:'student', definition:'learns' },
]

export const pictionarySeed: PictionaryItem[] = [
  { id:'p1', prompt:'embarrassed', hint:'feeling shy, red face', category:'Feelings' },
  { id:'p2', prompt:'bicycle', hint:'two wheels', category:'Objects' },
  { id:'p3', prompt:'volcano', hint:'mountain erupts', category:'Nature' },
  { id:'p4', prompt:'library', hint:'many books', category:'Places' },
  { id:'p5', prompt:'guitar', hint:'music instrument', category:'Music' },
]

export const twentyQSeed: TwentyQItem[] = [
  { id:'q1', secret:'ELEPHANT', hints:['It is an animal','It is very big','It has a trunk'], category:'Animals' },
  { id:'q2', secret:'PYRAMID', hints:['In Egypt','Triangle building','Made of stone'], category:'Places' },
  { id:'q3', secret:'BICYCLE', hints:['Has two wheels','You pedal it','No engine'], category:'Objects' },
  { id:'q4', secret:'LIBRARY', hints:['Quiet place','Many books','You borrow'], category:'Places' },
]
