# Local development image for the Jekyll site.
# Used via docker-compose.yml — see README.md for the workflow.

FROM ruby:3.2-slim-bookworm

# Native gems (sass-embedded, ffi, etc.) need a compiler toolchain.
# Git is needed for any gems sourced from Git in the Gemfile.
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      git \
   && rm -rf /var/lib/apt/lists/*

WORKDIR /site

# Install gems in a separate layer so source edits don't trigger
# a rebundle. Gemfile.lock is copied opportunistically (the trailing
# * makes the pattern non-fatal when the lock file isn't present yet).
COPY Gemfile Gemfile.lock* ./
RUN bundle install

# Code is mounted over /site at runtime by docker-compose.
# This COPY is a fallback for `docker build && docker run` without compose.
COPY . .

# 4000  — Jekyll dev server
# 35729 — LiveReload websocket
EXPOSE 4000 35729

CMD ["bundle", "exec", "jekyll", "serve", \
     "--host", "0.0.0.0", \
     "--livereload", \
     "--force_polling"]
