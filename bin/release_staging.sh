#! /bin/bash
if [[ $(git rev-parse --abbrev-ref HEAD) != "master" ]]; then
  echo "Can only deploy on Master branch";
  exit 1;
fi
git push aptible-staging master