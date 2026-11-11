#!/usr/bin/env bash
# TVFREAK: rutina semanal para traer upstream/dev al fork.
# Hace el merge en local y comprueba los enganches. No sube nada a GitHub:
# el push y la compilación se hacen aparte, cuando lo apruebes.
# Uso (desde la raíz del fork):  bash tvfreak/upstream-merge.sh
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
JAVA=app/src/main/java/com/nuvio/tv

check_hooks() {
  echo "Comprobando enganches // TVFREAK..."
  FAIL=0
  while read -r want path; do
    case "$want" in ''|\#*) continue ;; esac
    have=$(grep -c "// TVFREAK" "$JAVA/$path" 2>/dev/null || true)
    if [ "$have" = "$want" ]; then echo "  ok     $have/$want  $path"
    else echo "  FALTA  $have/$want  $path"; FAIL=1; fi
  done < tvfreak/hooks.txt
  echo "Total en app/src/main/java: $(grep -rn "// TVFREAK" app/src/main/java | wc -l)"
  if git diff --quiet upstream/dev -- app/src/main/res; then echo "  ok     app/src/main/res igual que upstream"
  else echo "  OJO    app/src/main/res difiere de upstream:"; git diff --stat upstream/dev -- app/src/main/res; FAIL=1; fi
  echo
  if [ "$FAIL" = "0" ]; then
    echo "Todo bien. Siguiente paso (con tu OK): git push origin dev y lanzar el workflow tvfreak.yml."
  else
    echo "Algo no cuadra. No subas nada hasta revisarlo."
    exit 1
  fi
}

if [ "${1:-}" = "--check" ]; then check_hooks; exit 0; fi

[ "$(git branch --show-current)" = "dev" ] || { echo "Ponte en la rama dev primero."; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "Hay cambios sin commit. Haz commit o guárdalos antes."; exit 1; }

# rerere recuerda cómo resolviste un conflicto y lo repite la semana siguiente
git config rerere.enabled true
git config rerere.autoupdate true

git fetch upstream dev
NEW=$(git rev-list --count HEAD..upstream/dev)
if [ "$NEW" = "0" ]; then echo "Nada nuevo en upstream/dev."; exit 0; fi
echo "Commits nuevos en upstream/dev: $NEW"
git log --oneline HEAD..upstream/dev | head -30

if ! git merge --no-ff --no-edit upstream/dev; then
  echo
  echo "CONFLICTOS. Archivos sin resolver:"
  git diff --name-only --diff-filter=U
  echo "Resuélvelos, git add, git commit, y vuelve a lanzar solo la comprobación:"
  echo "  bash tvfreak/upstream-merge.sh --check"
  exit 1
fi

echo
check_hooks
