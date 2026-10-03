using System;
using System.Collections;
using System.Collections.Generic;
using System.Web;
using System.Web.Caching;

namespace ProjectAPI.Models
{
    /// <summary>
    /// High-performance thread-safe application cache with automatic invalidation.
    /// Acts as Tier 1 Application Cache for homepage feeds, breaking news, and trending articles.
    /// </summary>
    public static class CacheService
    {
        private static Cache CacheInstance => HttpRuntime.Cache;

        /// <summary>
        /// Retrieves an item from cache or default(T) if not found.
        /// </summary>
        public static T Get<T>(string key)
        {
            if (CacheInstance == null || string.IsNullOrEmpty(key))
                return default(T);

            var item = CacheInstance.Get(key);
            if (item is T typedItem)
            {
                return typedItem;
            }

            return default(T);
        }

        /// <summary>
        /// Inserts an item into cache with absolute expiration.
        /// </summary>
        public static void Set(string key, object value, int durationMinutes = 3)
        {
            if (CacheInstance == null || string.IsNullOrEmpty(key) || value == null)
                return;

            CacheInstance.Insert(
                key,
                value,
                null,
                DateTime.UtcNow.AddMinutes(durationMinutes),
                Cache.NoSlidingExpiration,
                CacheItemPriority.Default,
                null
            );
        }

        /// <summary>
        /// Removes a specific cache key.
        /// </summary>
        public static void Remove(string key)
        {
            if (CacheInstance == null || string.IsNullOrEmpty(key))
                return;

            CacheInstance.Remove(key);
        }

        /// <summary>
        /// Flushes all news feed cache keys immediately upon create/edit/delete events.
        /// </summary>
        public static void InvalidateAllNewsCaches()
        {
            if (CacheInstance == null)
                return;

            var keysToRemove = new List<string>();
            IDictionaryEnumerator enumerator = CacheInstance.GetEnumerator();

            while (enumerator.MoveNext())
            {
                string key = enumerator.Key?.ToString();
                if (key != null && key.StartsWith("news_"))
                {
                    keysToRemove.Add(key);
                }
            }

            foreach (var key in keysToRemove)
            {
                CacheInstance.Remove(key);
            }
        }
    }
}
