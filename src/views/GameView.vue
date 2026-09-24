<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SpinWheelGame from '@/games/spin-wheel/SpinWheelGame.vue'
import QuizRaceGame from '@/games/quiz-race/QuizRaceGame.vue'
import MemoryMatchGame from '@/games/memory-match/MemoryMatchGame.vue'
import SentenceBuilderGame from '@/games/sentence-builder/SentenceBuilderGame.vue'
import HangmanGame from '@/games/hangman/HangmanGame.vue'
import WordRevealGame from '@/games/word-reveal/WordRevealGame.vue'
import OddOneOutGame from '@/games/odd-one-out/OddOneOutGame.vue'
import WordSortGame from '@/games/word-sort/WordSortGame.vue'
import AnagramGame from '@/games/anagram/AnagramGame.vue'
import EmojiStoryGame from '@/games/emoji-story/EmojiStoryGame.vue'
import BingoGame from '@/games/bingo/BingoGame.vue'
import PictionaryGame from '@/games/pictionary/PictionaryGame.vue'
import TwentyQuestionsGame from '@/games/twenty-questions/TwentyQuestionsGame.vue'

const route = useRoute()
const id = computed(()=> route.params.id as string)
const map:any = {
  'spin-wheel': SpinWheelGame,
  'quiz-race': QuizRaceGame,
  'memory-match': MemoryMatchGame,
  'sentence-builder': SentenceBuilderGame,
  'hangman': HangmanGame,
  'word-reveal': WordRevealGame,
  'odd-one-out': OddOneOutGame,
  'word-sort': WordSortGame,
  'anagram': AnagramGame,
  'emoji-story': EmojiStoryGame,
  'bingo': BingoGame,
  'pictionary': PictionaryGame,
  'twenty-questions': TwentyQuestionsGame,
}
const Comp = computed(()=> map[id.value])
</script>
<template>
  <div>
    <router-link to="/" class="font-bold text-sm text-duo-blue">← Back to Lobby</router-link>
    <h1 class="text-2xl font-black text-duo-text mt-2 capitalize">{{ (id as string).replace(/-/g,' ') }}</h1>
    <div class="mt-4">
      <component :is="Comp" v-if="Comp" />
      <p v-else class="font-bold text-duo-red">Unknown game {{ id }}</p>
    </div>
  </div>
</template>
