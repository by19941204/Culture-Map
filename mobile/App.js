import { useMemo, useState } from 'react'
import { useColorScheme } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { getLocales } from 'expo-localization'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

import { ThemeContext, palettes } from './src/theme'
import { LanguageContext } from './src/i18n'
import { translations } from './src/data'
import { useLoadedPrefs, savePref } from './src/prefs'

import CompareScreen from './src/screens/CompareScreen'
import CountriesScreen from './src/screens/CountriesScreen'
import CountryDetailScreen from './src/screens/CountryDetailScreen'
import DimensionsScreen from './src/screens/DimensionsScreen'
import AboutScreen from './src/screens/AboutScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const TAB_ICONS = { CompareTab: 'repeat', CountriesTab: 'globe', DimensionsTab: 'sliders', AboutTab: 'info' }

function CountriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Countries" component={CountriesScreen} />
      <Stack.Screen name="CountryDetail" component={CountryDetailScreen} />
    </Stack.Navigator>
  )
}

function Root({ initialPrefs }) {
  const system = useColorScheme()
  // null = follow the system appearance
  const [themePref, setThemePref] = useState(
    ['light', 'dark'].includes(initialPrefs['cm-theme']) ? initialPrefs['cm-theme'] : null,
  )
  const [lang, setLang] = useState(() => {
    if (['zh', 'en'].includes(initialPrefs['cm-lang'])) return initialPrefs['cm-lang']
    // first launch: follow the device language
    return getLocales()[0]?.languageCode === 'zh' ? 'zh' : 'en'
  })

  const dark = (themePref ?? system) === 'dark'
  const colors = dark ? palettes.dark : palettes.light

  const themeValue = useMemo(
    () => ({
      colors,
      dark,
      mode: themePref ?? 'auto',
      // cycle: follow system -> light -> dark -> follow system
      cycleTheme: () => {
        const next = themePref === null ? 'light' : themePref === 'light' ? 'dark' : null
        setThemePref(next)
        savePref('cm-theme', next ?? 'auto')
      },
    }),
    [colors, dark, themePref],
  )

  const langValue = useMemo(
    () => ({
      lang,
      t: (key) => translations[key]?.[lang] ?? key,
      pick: (obj, base) => obj?.[base + (lang === 'zh' ? 'Zh' : 'En')],
      toggleLang: () => {
        const next = lang === 'zh' ? 'en' : 'zh'
        setLang(next)
        savePref('cm-lang', next)
      },
    }),
    [lang],
  )

  const navTheme = useMemo(() => {
    const base = dark ? DarkTheme : DefaultTheme
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.page,
        card: colors.card,
        text: colors.ink,
        border: colors.line,
      },
    }
  }, [dark, colors])

  const { t } = langValue

  return (
    <ThemeContext.Provider value={themeValue}>
      <LanguageContext.Provider value={langValue}>
        <NavigationContainer theme={navTheme}>
          <StatusBar style={dark ? 'light' : 'dark'} />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: colors.accent,
              tabBarInactiveTintColor: colors.ink3,
              tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
              tabBarIcon: ({ color, size }) => (
                <Feather name={TAB_ICONS[route.name]} size={size - 4} color={color} />
              ),
            })}
          >
            <Tab.Screen
              name="CompareTab"
              component={CompareScreen}
              options={{ title: t('nav.compare'), tabBarLabel: t('nav.compare') }}
              initialParams={{ initialPrefs }}
            />
            <Tab.Screen
              name="CountriesTab"
              component={CountriesStack}
              options={{ title: t('nav.countries'), tabBarLabel: t('nav.countries') }}
            />
            <Tab.Screen
              name="DimensionsTab"
              component={DimensionsScreen}
              options={{ title: t('nav.dimensions'), tabBarLabel: t('nav.dimensions') }}
            />
            <Tab.Screen
              name="AboutTab"
              component={AboutScreen}
              options={{ title: t('nav.about'), tabBarLabel: t('nav.about') }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  )
}

export default function App() {
  const prefs = useLoadedPrefs()
  if (!prefs) return null // a few ms while AsyncStorage resolves; splash covers it
  return (
    <SafeAreaProvider>
      <Root initialPrefs={prefs} />
    </SafeAreaProvider>
  )
}
