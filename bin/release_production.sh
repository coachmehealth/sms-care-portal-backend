#! /bin/bash
if [[ $(git rev-parse --abbrev-ref HEAD) != "master" ]]; then
  echo "Can only deploy on Master branch";
  exit 1;
fi
git fetch aptible-staging
git push aptible-production aptible-staging/master:master