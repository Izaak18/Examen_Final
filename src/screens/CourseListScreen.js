import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategories, getCourses, getHealth } from '../services/api';

const COLORS = {
  background: '#F4F7FB',
  ink: '#17243A',
  muted: '#718096',
  primary: '#3858D6',
  line: '#E4EAF2',
  white: '#FFFFFF',
  paleBlue: '#EAF0FF',
  red: '#B42318',
  paleRed: '#FEF3F2',
  green: '#17845D',
  paleGreen: '#EAF8F1',
};

function CourseCard({ course, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.courseCard, pressed && styles.cardPressed]}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.courseIcon}>
          <Text style={styles.courseIconText}>A</Text>
        </View>
        <Text style={styles.cardArrow}>›</Text>
      </View>
      <Text style={styles.courseName}>{course.nombre}</Text>
      <Text style={styles.courseCategory}>
        {course.categoria?.nombre || 'Categoría académica'}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.durationLabel}>DURACIÓN</Text>
        <Text style={styles.durationValue}>{course.duracion_horas} horas</Text>
      </View>
    </Pressable>
  );
}

export default function CourseListScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [courseError, setCourseError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [apiOnline, setApiOnline] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadCourses, setReloadCourses] = useState(0);
  const [reloadCategories, setReloadCategories] = useState(0);
  const [reloadHealth, setReloadHealth] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingCategories(true);
    setCategoryError('');

    getCategories(controller.signal)
      .then(setCategories)
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCategoryError(error.message || 'No se pudieron cargar las categorías.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingCategories(false);
        }
      });

    return () => controller.abort();
  }, [reloadCategories]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingCourses(true);
    setCourseError('');
    setCourses([]);

    getCourses(selectedCategoryId, controller.signal)
      .then(setCourses)
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCourses([]);
          setCourseError(error.message || 'No se pudieron cargar los cursos.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingCourses(false);
          setRefreshing(false);
        }
      });

    return () => controller.abort();
  }, [selectedCategoryId, reloadCourses]);

  useEffect(() => {
    const controller = new AbortController();

    getHealth(controller.signal)
      .then(() => setApiOnline(true))
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiOnline(false);
        }
      });

    return () => controller.abort();
  }, [reloadHealth]);

  const onRefresh = () => {
    setRefreshing(true);
    setReloadCourses((value) => value + 1);
    setReloadCategories((value) => value + 1);
    setReloadHealth((value) => value + 1);
  };

  const renderCourse = ({ item }) => (
    <CourseCard
      course={item}
      onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={courses}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCourse}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <View style={styles.brandMark}>
                  <Text style={styles.brandMarkText}>A</Text>
                </View>
                <Text style={styles.brandName}>AULA</Text>
              </View>
              <View
                style={[
                  styles.apiBadge,
                  apiOnline === false ? styles.apiBadgeOffline : styles.apiBadgeOnline,
                ]}
              >
                <View
                  style={[
                    styles.apiDot,
                    apiOnline === false ? styles.apiDotOffline : styles.apiDotOnline,
                  ]}
                />
                <Text style={styles.apiBadgeText}>
                  {apiOnline === null ? 'Conectando' : apiOnline ? 'API en línea' : 'API sin conexión'}
                </Text>
              </View>
            </View>

            <View style={styles.intro}>
              <Text style={styles.eyebrow}>APRENDE A TU RITMO</Text>
              <Text style={styles.title}>Explora tus{'\n'}próximos cursos.</Text>
              <Text style={styles.subtitle}>
                Encuentra el curso ideal para impulsar tu camino académico.
              </Text>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Categorías</Text>
              {loadingCategories && <ActivityIndicator size="small" color={COLORS.primary} />}
            </View>

            {categoryError ? (
              <View style={styles.inlineError}>
                <Text style={styles.inlineErrorText}>{categoryError}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setReloadCategories((value) => value + 1)}
                >
                  <Text style={styles.retryText}>Reintentar</Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                <CategoryChip
                  label="Todas"
                  selected={selectedCategoryId === null}
                  onPress={() => setSelectedCategoryId(null)}
                />
                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    label={category.nombre}
                    selected={selectedCategoryId === category.id}
                    onPress={() => setSelectedCategoryId(category.id)}
                  />
                ))}
              </ScrollView>
            )}

            <View style={[styles.sectionHeading, styles.courseHeading]}>
              <View>
                <Text style={styles.sectionTitle}>Cursos destacados</Text>
                {!loadingCourses && !courseError && (
                  <Text style={styles.resultsCount}>
                    {courses.length} {courses.length === 1 ? 'curso disponible' : 'cursos disponibles'}
                  </Text>
                )}
              </View>
              {loadingCourses && <ActivityIndicator size="small" color={COLORS.primary} />}
            </View>

            {courseError ? (
              <View style={styles.messageCard}>
                <Text style={styles.messageTitle}>No pudimos conectar</Text>
                <Text style={styles.messageBody}>{courseError}</Text>
                <Pressable
                  accessibilityRole="button"
                  style={styles.retryButton}
                  onPress={() => setReloadCourses((value) => value + 1)}
                >
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </Pressable>
              </View>
            ) : loadingCourses && courses.length === 0 ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.messageBody}>Cargando cursos desde la API…</Text>
                <Text style={styles.loadingHint}>La primera conexión puede tardar un momento.</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !loadingCourses && !courseError ? (
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>Aún no hay cursos</Text>
              <Text style={styles.messageBody}>
                No encontramos cursos en esta categoría. Prueba con otra opción.
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
      />
    </SafeAreaView>
  );
}

function CategoryChip({ label, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.categoryChip, selected && styles.categoryChipSelected]}
    >
      <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 36,
  },
  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  brandMarkText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },
  brandName: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
  },
  apiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  apiBadgeOnline: {
    backgroundColor: COLORS.paleGreen,
  },
  apiBadgeOffline: {
    backgroundColor: COLORS.paleRed,
  },
  apiDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  apiDotOnline: {
    backgroundColor: COLORS.green,
  },
  apiDotOffline: {
    backgroundColor: COLORS.red,
  },
  apiBadgeText: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: '600',
  },
  intro: {
    paddingTop: 22,
    paddingBottom: 29,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 10,
  },
  title: {
    color: COLORS.ink,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 310,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  categoryRow: {
    paddingBottom: 5,
    paddingRight: 22,
  },
  categoryChip: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: COLORS.white,
  },
  courseHeading: {
    marginTop: 29,
    marginBottom: 14,
  },
  resultsCount: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  courseCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 18,
    padding: 17,
  },
  cardPressed: {
    opacity: 0.76,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  courseIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseIconText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  cardArrow: {
    color: COLORS.muted,
    fontSize: 26,
    lineHeight: 28,
  },
  courseName: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  courseCategory: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopColor: COLORS.line,
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 12,
  },
  durationLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  durationValue: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  cardSeparator: {
    height: 11,
  },
  inlineError: {
    backgroundColor: COLORS.paleRed,
    borderRadius: 12,
    padding: 12,
  },
  inlineErrorText: {
    color: COLORS.red,
    fontSize: 12,
  },
  retryText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  messageCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'flex-start',
  },
  messageTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  messageBody: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 14,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
  },
  loadingHint: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },
});
